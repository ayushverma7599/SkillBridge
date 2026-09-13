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
    },
    // Set when the poster's account is tied to a verified college, so the
    // project can be shown as "Posted by <College>" campus work.
    collegeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Rough weekly time commitment the poster expects. Used client-side to
    // warn a student if a project would blow past their safe workload.
    estimatedHoursPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {});

  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: 'freelancerId', as: 'freelancer' });
    Project.belongsTo(models.College, { foreignKey: 'collegeId', as: 'college' });
    Project.hasMany(models.Application, { foreignKey: 'projectId', as: 'applications' });
    Project.hasMany(models.Milestone, { foreignKey: 'projectId', as: 'milestones' });
  };

  return Project;
};
