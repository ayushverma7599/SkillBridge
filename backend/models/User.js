// backend/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student' // student, freelancer, admin
    }
    // yahan extra fields add kar sakte ho (photo, firebaseUid, etc.)
  }, {});

  // Future associations (e.g. User.hasMany(Project))
  User.associate = (models) => {
    // associations likh sakte ho, optional
  };

  return User;
};
