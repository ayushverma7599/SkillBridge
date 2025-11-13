const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Models import karo (e.g. User, Project, etc.)
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Project = require('./Project')(sequelize, Sequelize.DataTypes);
const Application = require('./Application')(sequelize, Sequelize.DataTypes);
const Milestone = require('./Milestone')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Conversation = require('./Conversation')(sequelize, Sequelize.DataTypes);
// ...baaki models bhi import & export karo
// Run associations
const models = { User, Project, Application, Milestone, Payment, Message, Conversation };
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
  // ...aur jo bhi models hain
};
