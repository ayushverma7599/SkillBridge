// backend/controllers/scheduleController.js
const { ScheduleItem, User } = require('../models');
const { computeWorkload } = require('../services/workloadService');

// List the current user's schedule (classes, exams, assignments)
exports.getSchedule = async (req, res) => {
  try {
    const items = await ScheduleItem.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a class slot / exam / assignment deadline
exports.addScheduleItem = async (req, res) => {
  try {
    const { type, title, dayOfWeek, startTime, endTime, dueDate } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: 'type and title are required' });
    }
    if (type === 'class' && (dayOfWeek === undefined || !startTime || !endTime)) {
      return res.status(400).json({ message: 'Classes need dayOfWeek, startTime and endTime' });
    }
    if ((type === 'exam' || type === 'assignment') && !dueDate) {
      return res.status(400).json({ message: 'Exams and assignments need a dueDate' });
    }

    const item = await ScheduleItem.create({
      userId: req.user.id,
      type,
      title,
      dayOfWeek: type === 'class' ? dayOfWeek : null,
      startTime: type === 'class' ? startTime : null,
      endTime: type === 'class' ? endTime : null,
      dueDate: type !== 'class' ? dueDate : null,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteScheduleItem = async (req, res) => {
  try {
    const item = await ScheduleItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: 'Schedule item not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// The headline feature: "how many freelance hours can I safely take this week?"
exports.getWorkload = async (req, res) => {
  try {
    const [items, user] = await Promise.all([
      ScheduleItem.findAll({ where: { userId: req.user.id } }),
      User.findByPk(req.user.id),
    ]);

    const workload = computeWorkload(items, user?.maxWeeklyHoursOverride);
    res.json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
