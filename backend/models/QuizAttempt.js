// backend/models/QuizAttempt.js
// One completed diagnostic/practice run. `answers` keeps the full per-question
// breakdown (questionId, conceptId, selectedIndex, isCorrect) so we can
// recompute per-concept accuracy without re-joining against Question rows
// that may later change.
module.exports = (sequelize, DataTypes) => {
  const QuizAttempt = sequelize.define('QuizAttempt', {
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
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scorePercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  QuizAttempt.associate = (models) => {
    QuizAttempt.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return QuizAttempt;
};
