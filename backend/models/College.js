// backend/models/College.js
// A verified list of colleges/universities. A student's registration email
// domain is checked against this table to decide whether their account is
// "verified" (i.e. confirmed to belong to a real campus) or a college admin
// account is allowed to post work on behalf of that institution.
module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Email domain used to auto-verify students, e.g. "nitw.ac.in"
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  College.associate = (models) => {
    College.hasMany(models.User, { foreignKey: 'collegeId', as: 'students' });
    College.hasMany(models.Project, { foreignKey: 'collegeId', as: 'projects' });
  };

  return College;
};
