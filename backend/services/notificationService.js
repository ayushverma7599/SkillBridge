// Notification service for real-time updates
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', notification);
    console.log(`📩 Notification sent to user ${userId}:`, notification.message);
  }

  // Broadcast to all users
  broadcast(notification) {
    this.io.emit('notification', notification);
    console.log('📢 Broadcast notification:', notification.message);
  }

  // Project application notification
  notifyProjectApplication(freelancerId, studentName, projectTitle) {
    this.sendToUser(freelancerId, {
      type: 'project_application',
      message: `${studentName} applied to your project: ${projectTitle}`,
      timestamp: new Date(),
      read: false
    });
  }

  // Project status update
  notifyProjectUpdate(userId, projectTitle, status) {
    this.sendToUser(userId, {
      type: 'project_update',
      message: `Project "${projectTitle}" status updated to: ${status}`,
      timestamp: new Date(),
      read: false
    });
  }
}

module.exports = NotificationService;
