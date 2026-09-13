module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {});

  Application.associate = (models) => {
    Application.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    Application.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
  };

  return Application;
};
