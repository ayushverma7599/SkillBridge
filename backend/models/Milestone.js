module.exports = (sequelize, DataTypes) => {
  const Milestone = sequelize.define('Milestone', {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'submitted', 'approved', 'rejected'),
      defaultValue: 'pending'
    }
  }, {});

  Milestone.associate = (models) => {
    Milestone.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return Milestone;
};
