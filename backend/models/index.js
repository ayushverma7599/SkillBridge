// backend/models/index.js

require('dotenv').config(); // Sabse upar likho

const { Sequelize } = require('sequelize');

// Accept either a single DATABASE_URL, or the individual DB_HOST/DB_PORT/
// DB_NAME/DB_USER/DB_PASSWORD pieces from .env.example — filling in only
// the individual pieces (which is what the example file invites you to do)
// used to crash with "url argument must be of type string" because this
// file only ever looked at DATABASE_URL.
//
// When we do have to build the connection from parts, we pass them to
// Sequelize as an explicit config object rather than assembling a
// "postgresql://user:pass@host:port/db" string ourselves: string-based
// connection URLs go through an extra parsing step (Sequelize splits the
// string apart, then hands the pieces to `pg`) and on some Node/Sequelize
// version combinations that parsing silently drops or mistypes the
// password, which surfaces deep inside `pg` as the very confusing
// "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
// error. Passing host/port/username/password/database directly skips that
// parsing step entirely.
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  // No DATABASE_URL — fall back to the individual DB_* vars. If DB_PASSWORD
  // is missing entirely (most commonly: there is no backend/.env file at
  // all, so *every* DB_* var is undefined), do NOT silently fall through to
  // an empty-string password. Postgres with SCRAM-SHA-256 auth (the default
  // on modern installs) rejects an empty password deep inside the `pg`
  // driver's SASL handshake with the famously unhelpful:
  //   "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
  // That error gives no hint that the real problem is "no .env file was
  // ever created." Fail fast here instead, with a message that says exactly
  // what to do.
  if (process.env.DB_PASSWORD == null) {
    console.error(
      '\n[FATAL] No DATABASE_URL and no DB_PASSWORD found in the environment.\n' +
      'This almost always means backend/.env does not exist yet (or is missing DB_PASSWORD).\n\n' +
      'Fix: create backend/.env (copy backend/.env.example if present) with at least:\n' +
      '  DB_HOST=localhost\n' +
      '  DB_PORT=5432\n' +
      '  DB_NAME=skillbridge_db\n' +
      '  DB_USER=skillbridge_admin\n' +
      '  DB_PASSWORD=your_actual_password\n\n' +
      'Then restart the server. (Without this, Postgres/pg would otherwise fail later with a\n' +
      'confusing "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string" error.)\n'
    );
    process.exit(1);
  }

  console.log('DATABASE_URL not set — connecting using DB_HOST/DB_USER/DB_NAME instead');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'skillbridge_db',
    process.env.DB_USER || 'postgres',
    String(process.env.DB_PASSWORD),
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Baaki models import karo
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Project = require('./Project')(sequelize, Sequelize.DataTypes);
const Application = require('./Application')(sequelize, Sequelize.DataTypes);
const Milestone = require('./Milestone')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Conversation = require('./Conversation')(sequelize, Sequelize.DataTypes);
const College = require('./College')(sequelize, Sequelize.DataTypes);
const ScheduleItem = require('./ScheduleItem')(sequelize, Sequelize.DataTypes);
const Concept = require('./Concept')(sequelize, Sequelize.DataTypes);
const Question = require('./Question')(sequelize, Sequelize.DataTypes);
const QuizAttempt = require('./QuizAttempt')(sequelize, Sequelize.DataTypes);
const StudyPlan = require('./StudyPlan')(sequelize, Sequelize.DataTypes);

// Models object
const models = {
  User, Project, Application, Milestone, Payment, Message, Conversation, College, ScheduleItem,
  Concept, Question, QuizAttempt, StudyPlan,
};

// Models associations (agar kisi model ki associate function hai toh run karo)
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  User,
  Project,
  Application,
  Milestone,
  Payment,
  Message,
  Conversation,
  College,
  ScheduleItem,
  Concept,
  Question,
  QuizAttempt,
  StudyPlan,
  // ...add more models yahan agar banaye ho toh
};
