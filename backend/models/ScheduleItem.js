// backend/models/ScheduleItem.js
// One entry in a student's academic calendar: a recurring class slot, an
// exam, or an assignment deadline. The workload service reads these to
// figure out how many freelance hours a student can safely take on.
module.exports = (sequelize, DataTypes) => {
  const ScheduleItem = sequelize.define('ScheduleItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      // class: recurring weekly timetable slot
      // exam: a single high-priority date that should throttle work hard
      // assignment: a deadline that should throttle work moderately
      type: DataTypes.ENUM('class', 'exam', 'assignment'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // For 'class': 0=Sunday..6=Saturday. Null for exam/assignment.
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    startTime: {
      // "HH:MM" 24hr, used for 'class' items only
      type: DataTypes.STRING,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // For 'exam' / 'assignment': the actual calendar date it falls on.
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  });

  ScheduleItem.associate = (models) => {
    ScheduleItem.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return ScheduleItem;
};
