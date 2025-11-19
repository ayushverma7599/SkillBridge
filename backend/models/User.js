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
      type: DataTypes.ENUM('student', 'freelancer'),
      defaultValue: 'student'
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

  return User;
};
