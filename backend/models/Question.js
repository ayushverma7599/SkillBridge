// backend/models/Question.js
// A single multiple-choice diagnostic/practice question, tagged to one
// Concept. `subject` is denormalized onto the row (copied from its Concept)
// purely so the diagnostic-quiz query can filter by subject without a join.
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conceptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Array of option strings, e.g. ["O(n)", "O(log n)", "O(n^2)", "O(1)"]
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'medium',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Concept, { foreignKey: 'conceptId' });
  };

  return Question;
};
