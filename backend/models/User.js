module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      // 'student': can browse/apply to projects and log academic schedule
      // 'freelancer': legacy name for a student who *posts* project/task work
      // 'college': a college/university account that posts verified campus work
      type: DataTypes.ENUM('student', 'freelancer', 'college'),
      defaultValue: 'student'
    },
    collegeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // true when the registration email's domain matched a known college
    // domain in the College table (see backend/services/verificationService.js)
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Optional manual override of the auto-computed weekly freelance hour cap.
    maxWeeklyHoursOverride: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,  // ADD THIS FIELD
      allowNull: true,
      defaultValue: null
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
      type: DataTypes.JSONB,  // For PostgreSQL
      allowNull: true,
      defaultValue: []
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true
    },
    course: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.College, { foreignKey: 'collegeId', as: 'college' });
    User.hasMany(models.ScheduleItem, { foreignKey: 'userId', as: 'scheduleItems' });
  };

  return User;
};
