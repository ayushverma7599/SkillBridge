// backend/services/workloadService.js
//
// The "Smart Schedule & Workload Manager" from the pitch: turns a student's
// academic calendar into a single, explainable number — how many freelance
// hours they can safely take on *this week* — so the platform can throttle
// applications automatically instead of relying on the student's own
// (usually optimistic) judgement.

const DEFAULT_WEEKLY_CAP = 20; // hours/week for a student with a light course load

function daysUntil(dateOnly) {
  if (!dateOnly) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateOnly);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function classHoursThisWeek(scheduleItems) {
  return scheduleItems
    .filter((item) => item.type === 'class' && item.startTime && item.endTime)
    .reduce((total, item) => {
      const [sh, sm] = item.startTime.split(':').map(Number);
      const [eh, em] = item.endTime.split(':').map(Number);
      const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
      return total + Math.max(hours, 0);
    }, 0);
}

/**
 * @param {Array} scheduleItems - the student's ScheduleItem rows
 * @param {number|null} overrideCap - User.maxWeeklyHoursOverride, if set
 * @returns {{ allowedHoursThisWeek: number, baseCap: number, status: string, reasons: string[] }}
 */
function computeWorkload(scheduleItems = [], overrideCap = null) {
  const baseCap = overrideCap && overrideCap > 0 ? overrideCap : DEFAULT_WEEKLY_CAP;
  const reasons = [];
  let cap = baseCap;

  // 1. Class load: every 2 hours of weekly lectures/labs costs 1 hour of
  //    freelance capacity (the rest of the week is study/rest time already
  //    "spent" whether or not the student freelances).
  const classHours = classHoursThisWeek(scheduleItems);
  if (classHours > 0) {
    const deduction = Math.round(classHours / 2);
    cap -= deduction;
    reasons.push(`-${deduction}h for ${Math.round(classHours)}h of weekly classes`);
  }

  // 2. Exams: the closer the exam, the harder the throttle.
  const examDays = scheduleItems
    .filter((i) => i.type === 'exam')
    .map((i) => daysUntil(i.dueDate))
    .filter((d) => d >= 0);
  const nearestExam = examDays.length ? Math.min(...examDays) : Infinity;

  let status = 'normal';
  if (nearestExam <= 3) {
    status = 'exam_lockdown';
    cap = Math.min(cap, 3);
    reasons.push(`Exam in ${nearestExam}d — workload locked down to protect study time`);
  } else if (nearestExam <= 7) {
    status = 'reduced';
    cap -= 8;
    reasons.push(`Exam in ${nearestExam}d — capacity reduced for revision`);
  }

  // 3. Assignments: a smaller, additive throttle.
  const assignmentDays = scheduleItems
    .filter((i) => i.type === 'assignment')
    .map((i) => daysUntil(i.dueDate))
    .filter((d) => d >= 0);
  const nearestAssignment = assignmentDays.length ? Math.min(...assignmentDays) : Infinity;

  if (nearestAssignment <= 2) {
    cap -= 4;
    reasons.push(`Assignment due in ${nearestAssignment}d`);
    if (status === 'normal') status = 'reduced';
  } else if (nearestAssignment <= 5) {
    cap -= 2;
    reasons.push(`Assignment due in ${nearestAssignment}d`);
  }

  cap = Math.max(0, Math.round(cap));
  if (status === 'normal' && cap < baseCap * 0.6) status = 'reduced';
  if (reasons.length === 0) reasons.push('No exams or deadlines in the next 7 days');

  return { allowedHoursThisWeek: cap, baseCap, status, reasons };
}

module.exports = { computeWorkload, DEFAULT_WEEKLY_CAP };
