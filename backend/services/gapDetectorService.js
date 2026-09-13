// backend/services/gapDetectorService.js
//
// AI Learning Gap Detector — rule-based (no external LLM call, no API key
// needed). A student answers a short diagnostic quiz; we group the answers
// by tagged Concept, compute accuracy per concept, and flag anything below
// WEAK_THRESHOLD as a gap. The study plan is rebuilt from scratch on every
// submitted attempt, which is what makes it "adapt automatically" — the
// next test's results simply replace the previous plan.

const { Concept, Question, QuizAttempt, StudyPlan } = require('../models');
const { Op } = require('sequelize');

const WEAK_THRESHOLD = 0.6; // below 60% correct on a concept counts as a gap
const QUESTIONS_PER_CONCEPT = 2; // diagnostic quiz size per concept
const PRACTICE_QUESTIONS_PER_WEAK_CONCEPT = 3;

async function getSubjects() {
  const rows = await Concept.findAll({
    attributes: ['subject'],
    group: ['subject'],
    order: [['subject', 'ASC']],
  });
  return rows.map((r) => r.subject);
}

// Build a diagnostic quiz: a handful of questions spread across every
// concept in the subject, answers/explanations stripped out.
async function getDiagnosticQuiz(subject) {
  const concepts = await Concept.findAll({ where: { subject } });
  if (concepts.length === 0) return { subject, concepts: [], questions: [] };

  const questions = [];
  for (const concept of concepts) {
    const pool = await Question.findAll({ where: { conceptId: concept.id } });
    const picked = shuffle(pool).slice(0, QUESTIONS_PER_CONCEPT);
    questions.push(
      ...picked.map((q) => ({
        id: q.id,
        conceptId: q.conceptId,
        conceptName: concept.name,
        text: q.text,
        options: q.options,
        difficulty: q.difficulty,
      }))
    );
  }

  return { subject, questions: shuffle(questions) };
}

// answers: [{ questionId, selectedIndex }]
async function submitAttempt({ userId, subject, answers }) {
  if (!Array.isArray(answers) || answers.length === 0) {
    const err = new Error('answers must be a non-empty array');
    err.statusCode = 400;
    throw err;
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.findAll({
    where: { id: { [Op.in]: questionIds } },
    include: [{ model: Concept }],
  });
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const scored = answers
    .map((a) => {
      const question = questionById.get(a.questionId);
      if (!question) return null;
      return {
        questionId: a.questionId,
        conceptId: question.conceptId,
        conceptName: question.Concept?.name,
        selectedIndex: a.selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect: a.selectedIndex === question.correctIndex,
      };
    })
    .filter(Boolean);

  const correctCount = scored.filter((s) => s.isCorrect).length;
  const totalQuestions = scored.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;

  // Group by concept.
  const byConcept = new Map();
  for (const s of scored) {
    if (!byConcept.has(s.conceptId)) {
      byConcept.set(s.conceptId, { conceptId: s.conceptId, name: s.conceptName, correct: 0, total: 0 });
    }
    const bucket = byConcept.get(s.conceptId);
    bucket.total += 1;
    if (s.isCorrect) bucket.correct += 1;
  }

  const conceptBreakdown = Array.from(byConcept.values()).map((c) => ({
    conceptId: c.conceptId,
    name: c.name,
    accuracy: Math.round((c.correct / c.total) * 100),
    correct: c.correct,
    total: c.total,
  }));

  const weakConceptIds = conceptBreakdown
    .filter((c) => c.accuracy / 100 < WEAK_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((c) => c.conceptId);

  const strongConcepts = conceptBreakdown
    .filter((c) => c.accuracy / 100 >= WEAK_THRESHOLD)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((c) => ({ conceptId: c.conceptId, name: c.name, accuracy: c.accuracy }));

  const weakConcepts = [];
  for (const conceptId of weakConceptIds) {
    const concept = await Concept.findByPk(conceptId);
    const breakdown = conceptBreakdown.find((c) => c.conceptId === conceptId);

    // Prefer practice questions the student got wrong or hasn't seen yet in
    // this attempt, so practice isn't just re-showing what they already got
    // right.
    const missedIds = scored.filter((s) => s.conceptId === conceptId && !s.isCorrect).map((s) => s.questionId);
    const seenIds = scored.filter((s) => s.conceptId === conceptId).map((s) => s.questionId);
    const pool = await Question.findAll({ where: { conceptId } });
    const prioritized = [
      ...pool.filter((q) => missedIds.includes(q.id)),
      ...shuffle(pool.filter((q) => !seenIds.includes(q.id))),
      ...pool.filter((q) => seenIds.includes(q.id) && !missedIds.includes(q.id)),
    ];
    const practiceQuestions = dedupeById(prioritized)
      .slice(0, PRACTICE_QUESTIONS_PER_WEAK_CONCEPT)
      .map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));

    weakConcepts.push({
      conceptId,
      name: concept.name,
      accuracy: breakdown.accuracy,
      studyTip: concept.studyTip,
      practiceQuestions,
    });
  }

  const attempt = await QuizAttempt.create({
    userId,
    subject,
    totalQuestions,
    correctCount,
    scorePercent,
    answers: scored,
  });

  // Adaptive plan: always replace the previous one for this user+subject
  // with what the *latest* attempt shows. Done as an explicit find-then-
  // write rather than Model.upsert() so it doesn't depend on Sequelize
  // correctly inferring the (userId, subject) unique index as the ON
  // CONFLICT target.
  let plan = await StudyPlan.findOne({ where: { userId, subject } });
  if (plan) {
    await plan.update({ sourceAttemptId: attempt.id, weakConcepts, strongConcepts });
  } else {
    plan = await StudyPlan.create({ userId, subject, sourceAttemptId: attempt.id, weakConcepts, strongConcepts });
  }

  return {
    attemptId: attempt.id,
    subject,
    scorePercent,
    correctCount,
    totalQuestions,
    conceptBreakdown,
    weakConcepts,
    strongConcepts,
    planUpdatedAt: plan?.updatedAt || new Date(),
  };
}

async function getStudyPlan(userId, subject) {
  return StudyPlan.findOne({ where: { userId, subject } });
}

async function getAttemptHistory(userId, subject) {
  const where = { userId };
  if (subject) where.subject = subject;
  return QuizAttempt.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 20,
    attributes: ['id', 'subject', 'scorePercent', 'correctCount', 'totalQuestions', 'createdAt'],
  });
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dedupeById(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

module.exports = {
  WEAK_THRESHOLD,
  getSubjects,
  getDiagnosticQuiz,
  submitAttempt,
  getStudyPlan,
  getAttemptHistory,
};
