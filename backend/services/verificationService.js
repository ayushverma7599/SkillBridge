// backend/services/verificationService.js
//
// Campus verification: SkillBridge only lets *verified* students post or apply
// to campus work. Verification is done the cheap, hackathon-friendly way —
// by matching the registration email's domain against a seeded table of
// known college domains — rather than a real document-upload KYC flow.

const { College } = require('../models');

// Seed list used on first boot if the colleges table is empty. Feel free to
// add your own campus here before a demo.
const DEFAULT_COLLEGES = [
  { name: 'Indian Institute of Technology Delhi', domain: 'iitd.ac.in', city: 'Delhi' },
  { name: 'Indian Institute of Technology Bombay', domain: 'iitb.ac.in', city: 'Mumbai' },
  { name: 'National Institute of Technology Warangal', domain: 'nitw.ac.in', city: 'Warangal' },
  { name: 'Delhi Technological University', domain: 'dtu.ac.in', city: 'Delhi' },
  { name: 'VIT Vellore', domain: 'vit.ac.in', city: 'Vellore' },
  { name: 'SkillBridge Demo University', domain: 'skillbridge.edu', city: 'Demo' },
];

async function seedColleges() {
  const count = await College.count();
  if (count > 0) return;
  await College.bulkCreate(DEFAULT_COLLEGES);
  console.log(`✅ Seeded ${DEFAULT_COLLEGES.length} colleges for verification`);
}

function domainOf(email) {
  const at = (email || '').lastIndexOf('@');
  if (at === -1) return null;
  return email.slice(at + 1).toLowerCase().trim();
}

// Returns the matching College row, or null if the email's domain isn't a
// known campus domain yet (the user can still register — just unverified).
async function findCollegeByEmail(email) {
  const domain = domainOf(email);
  if (!domain) return null;
  return College.findOne({ where: { domain } });
}

module.exports = { seedColleges, findCollegeByEmail, domainOf, DEFAULT_COLLEGES };
