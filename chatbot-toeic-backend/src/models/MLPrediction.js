import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MLPrediction = sequelize.define(
    'MLPrediction',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One prediction per user
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      weakSkills: {
        type: DataTypes.TEXT, // JSON string: ["Grammar", "Vocabulary"]
        allowNull: true,
        get() {
          const raw = this.getDataValue('weakSkills');
          return raw ? JSON.parse(raw) : [];
        },
        set(value) {
          this.setDataValue('weakSkills', JSON.stringify(value));
        },
      },
      questionIds: {
        type: DataTypes.TEXT, // JSON string: [363, 364, 365, ...]
        allowNull: true,
        get() {
          const raw = this.getDataValue('questionIds');
          return raw ? JSON.parse(raw) : [];
        },
        set(value) {
          this.setDataValue('questionIds', JSON.stringify(value));
        },
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      totalAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      overallAccuracy: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('GETDATE()'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('GETDATE()'),
      },
    },
    {
      tableName: 'MLPredictions',
      timestamps: true, // Let Sequelize handle timestamps automatically
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  MLPrediction.associate = (models) => {
    MLPrediction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return MLPrediction;
};
