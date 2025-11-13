module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    participantOneId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    participantTwoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {});

  Conversation.associate = (models) => {
    Conversation.hasMany(models.Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
  };

  return Conversation;
};
