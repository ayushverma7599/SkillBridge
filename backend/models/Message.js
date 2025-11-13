module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {});

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversationId' });
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
  };

  return Message;
};
