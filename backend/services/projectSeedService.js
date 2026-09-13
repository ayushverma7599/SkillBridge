// backend/services/projectSeedService.js
//
// First-boot demo data for the Projects board and (by extension) the AI
// recommendations screen, which just ranks whatever's in the Projects table
// against the logged-in user's skills — there's no separate "recommendation"
// data to seed, only projects with real `skills` arrays for it to match
// against. No-ops if any project already exists.

const bcrypt = require('bcryptjs');
const { Project, User, College } = require('../models');

// A handful of posting accounts spread across the colleges seeded by
// verificationService, so projects show a realistic mix of "Posted by
// <College>" badges. Not meant to be logged into — the password is random
// and never surfaced — but hashed properly anyway rather than left plain.
const POSTERS = [
  { fullName: 'Ananya Rao', email: 'ananya.rao@iitd.ac.in', collegeDomain: 'iitd.ac.in' },
  { fullName: 'Karthik Iyer', email: 'karthik.iyer@iitb.ac.in', collegeDomain: 'iitb.ac.in' },
  { fullName: 'Priya Menon', email: 'priya.menon@dtu.ac.in', collegeDomain: 'dtu.ac.in' },
  { fullName: 'Rohan Shah', email: 'rohan.shah@vit.ac.in', collegeDomain: 'vit.ac.in' },
  { fullName: 'Simran Kaur', email: 'simran.kaur@nitw.ac.in', collegeDomain: 'nitw.ac.in' },
];

const PROJECTS = [
  {
    title: 'React landing page for campus tech fest',
    description:
      'Need a responsive one-page site for our annual tech fest — hero section, schedule, speaker cards, and a registration form that posts to a Google Sheet. Design mocks are ready in Figma.',
    budget: 6000,
    category: 'web-development',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    estimatedHoursPerWeek: 8,
    posterEmail: 'ananya.rao@iitd.ac.in',
  },
  {
    title: 'Fix bugs in Flutter attendance app',
    description:
      'Our hostel attendance app (Flutter + Firebase) has three open bugs: QR scanner crashes on Android 13, timestamps show the wrong timezone, and the admin export button does nothing. Codebase is on GitHub.',
    budget: 4500,
    category: 'mobile-development',
    skills: ['Flutter', 'Dart', 'Firebase'],
    estimatedHoursPerWeek: 6,
    posterEmail: 'karthik.iyer@iitb.ac.in',
  },
  {
    title: 'Redesign UI for hostel room-booking app',
    description:
      'Current UI is functional but ugly and confusing. Looking for 6-8 redesigned screens (booking flow, room details, payment) in Figma, following Material 3 guidelines.',
    budget: 5500,
    category: 'design',
    skills: ['Figma', 'UI/UX', 'Product Design'],
    estimatedHoursPerWeek: 7,
    posterEmail: 'priya.menon@dtu.ac.in',
  },
  {
    title: 'Node.js backend for club event manager',
    description:
      'Building an event RSVP + check-in tool for our robotics club. Need a REST API (Express + PostgreSQL) with auth, event CRUD, and QR-code check-in. Frontend is already in progress separately.',
    budget: 9000,
    category: 'web-development',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'JavaScript'],
    estimatedHoursPerWeek: 10,
    posterEmail: 'rohan.shah@vit.ac.in',
  },
  {
    title: 'Python script to auto-grade MCQ answer sheets',
    description:
      'Need a Python script (OpenCV) that reads scanned OMR sheets and outputs scores to a CSV. Will be used by the TA team for a 200-student course, so it needs to handle skewed scans reasonably well.',
    budget: 7000,
    category: 'data-science',
    skills: ['Python', 'OpenCV', 'Data Processing'],
    estimatedHoursPerWeek: 9,
    posterEmail: 'simran.kaur@nitw.ac.in',
  },
  {
    title: 'Logo & brand kit for coding club',
    description:
      'Our club is rebranding — need a logo, color palette, and a one-page brand guide (fonts, usage examples) we can hand to anyone designing posters or merch.',
    budget: 2500,
    category: 'design',
    skills: ['Illustrator', 'Branding', 'Graphic Design'],
    estimatedHoursPerWeek: 4,
    posterEmail: 'ananya.rao@iitd.ac.in',
  },
  {
    title: 'iOS SwiftUI screens for lost-and-found app',
    description:
      'Prototype exists in Figma; need 5 SwiftUI screens wired to a mock API (endpoints will be provided). Report/browse/claim flow for a campus lost-and-found board.',
    budget: 8000,
    category: 'mobile-development',
    skills: ['Swift', 'SwiftUI', 'iOS'],
    estimatedHoursPerWeek: 8,
    posterEmail: 'karthik.iyer@iitb.ac.in',
  },
  {
    title: 'MongoDB + Express API for library seat booking',
    description:
      'Library wants students to reserve study seats online. Need a small API: list seats, book/cancel, admin override. MongoDB + Express, roughly 6 endpoints total.',
    budget: 6500,
    category: 'web-development',
    skills: ['MongoDB', 'Express', 'Node.js', 'TypeScript'],
    estimatedHoursPerWeek: 7,
    posterEmail: 'priya.menon@dtu.ac.in',
  },
  {
    title: 'Data entry & cleanup for alumni survey',
    description:
      'We have ~1,200 alumni survey responses in messy Excel exports (duplicate rows, inconsistent formatting). Need them cleaned and consolidated into one sheet with standardized columns.',
    budget: 3000,
    category: 'data-entry',
    skills: ['Excel', 'Data Entry', 'Data Processing'],
    estimatedHoursPerWeek: 5,
    posterEmail: 'rohan.shah@vit.ac.in',
  },
  {
    title: 'Instagram content calendar for placement cell',
    description:
      'Need a month of Instagram post designs (Canva or Figma fine) announcing placement drives, plus 3 short reel scripts. Brand assets will be shared.',
    budget: 3500,
    category: 'content-writing',
    skills: ['Content Writing', 'Canva', 'Social Media'],
    estimatedHoursPerWeek: 5,
    posterEmail: 'simran.kaur@nitw.ac.in',
  },
  {
    title: 'TensorFlow model for handwriting digit recognition demo',
    description:
      'Need a simple CNN trained on MNIST, wrapped in a small Flask API with a demo web page (draw a digit, get a prediction). This is for a departmental open-house demo.',
    budget: 7500,
    category: 'data-science',
    skills: ['Python', 'TensorFlow', 'Machine Learning', 'Flask'],
    estimatedHoursPerWeek: 8,
    posterEmail: 'ananya.rao@iitd.ac.in',
  },
  {
    title: 'Kotlin Android widget for class timetable',
    description:
      'Small home-screen widget showing the next 2 classes from a timetable stored locally (Room DB). Should refresh automatically at the top of each hour.',
    budget: 5000,
    category: 'mobile-development',
    skills: ['Kotlin', 'Android', 'Room'],
    estimatedHoursPerWeek: 6,
    posterEmail: 'karthik.iyer@iitb.ac.in',
  },
  {
    title: 'Next.js portfolio site template for seniors',
    description:
      'Building a reusable Next.js portfolio template graduating seniors can fork for job applications — projects grid, resume download, dark mode. Should deploy cleanly to Vercel.',
    budget: 6000,
    category: 'web-development',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    estimatedHoursPerWeek: 7,
    posterEmail: 'priya.menon@dtu.ac.in',
  },
];

async function seedProjects() {
  const existing = await Project.count();
  if (existing > 0) return;

  // Ensure poster accounts exist (create any missing ones).
  const posterByEmail = new Map();
  for (const p of POSTERS) {
    let user = await User.findOne({ where: { email: p.email } });
    if (!user) {
      const college = await College.findOne({ where: { domain: p.collegeDomain } });
      const password = await bcrypt.hash(`seed-${Math.random().toString(36).slice(2)}`, 10);
      user = await User.create({
        fullName: p.fullName,
        email: p.email,
        password,
        userType: 'freelancer',
        collegeId: college?.id || null,
        isVerified: !!college,
        university: college?.name || null,
      });
    }
    posterByEmail.set(p.email, user);
  }

  const posterCollegeCache = new Map();
  for (const p of PROJECTS) {
    const poster = posterByEmail.get(p.posterEmail);
    if (!posterCollegeCache.has(poster.id)) posterCollegeCache.set(poster.id, poster.collegeId);

    await Project.create({
      title: p.title,
      description: p.description,
      budget: p.budget,
      category: p.category,
      skills: p.skills,
      estimatedHoursPerWeek: p.estimatedHoursPerWeek,
      freelancerId: poster.id,
      collegeId: posterCollegeCache.get(poster.id),
      status: 'open',
    });
  }

  console.log(`✅ Seeded ${PROJECTS.length} demo projects from ${posterByEmail.size} posters`);
}

module.exports = { seedProjects };
