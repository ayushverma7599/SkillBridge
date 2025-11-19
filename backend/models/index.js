// backend/models/index.js

require('dotenv').config(); // Sabse upar likho

const { Sequelize } = require('sequelize');

// Debugging: Check karo ki DATABASE_URL load ho rahi hai ya nahi
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Sequelize instance create karo
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Baaki models import karo
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Project = require('./Project')(sequelize, Sequelize.DataTypes);
const Application = require('./Application')(sequelize, Sequelize.DataTypes);
const Milestone = require('./Milestone')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Conversation = require('./Conversation')(sequelize, Sequelize.DataTypes);

// Models object
const models = { User, Project, Application, Milestone, Payment, Message, Conversation };

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
  // ...add more models yahan agar banaye ho toh
};
