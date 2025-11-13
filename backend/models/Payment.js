module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    milestoneId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {});

  Payment.associate = (models) => {
    Payment.belongsTo(models.Project, { foreignKey: 'projectId' });
    Payment.belongsTo(models.User, { foreignKey: 'freelancerId', as: 'freelancer' });
  };

  return Payment;
};
