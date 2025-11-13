module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'open'
    },
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: 'freelancerId', as: 'freelancer' });
  };

  return Project;
};
