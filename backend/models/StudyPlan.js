// backend/models/StudyPlan.js
// The student's current personalized plan for one subject — always
// overwritten (not appended) by the latest QuizAttempt, which is what makes
// it "adapt automatically": take a new test, the plan is regenerated from
// that attempt's results.
module.exports = (sequelize, DataTypes) => {
  const StudyPlan = sequelize.define('StudyPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceAttemptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // [{ conceptId, name, accuracy, studyTip, practiceQuestions: [...] }],
    // worst accuracy first.
    weakConcepts: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    // [{ conceptId, name, accuracy }] — concepts the student already has a
    // handle on, kept for a fuller report (not part of the "to-do" plan).
    strongConcepts: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  }, {
    indexes: [{ unique: true, fields: ['userId', 'subject'] }],
  });

  StudyPlan.associate = (models) => {
    StudyPlan.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return StudyPlan;
};
