// backend/models/Concept.js
// A single gradeable topic within a subject (e.g. "Recursion" inside
// "Data Structures & Algorithms"). Questions are tagged to one concept each;
// the gap detector scores a student's accuracy per concept, not per question.
module.exports = (sequelize, DataTypes) => {
  const Concept = sequelize.define('Concept', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Short, actionable advice shown on the study plan when this concept is
    // flagged as weak — e.g. "Re-derive recurrence relations by hand before
    // jumping to code."
    studyTip: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Concept.associate = (models) => {
    Concept.hasMany(models.Question, { foreignKey: 'conceptId' });
  };

  return Concept;
};
