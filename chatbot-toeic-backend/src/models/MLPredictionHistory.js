// models/MLPredictionHistory.js
// Mục đích: Lưu lịch sử predictions để track trend và phân tích model drift
// INSERT ONLY table (không UPDATE) - multiple records per user

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class MLPredictionHistory extends Model {
    static associate(models) {
      MLPredictionHistory.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  MLPredictionHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        index: true,
      },
      weakSkills: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of weak skill names',
        get() {
          const raw = this.getDataValue('weakSkills');
          try {
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            console.error('Error parsing weakSkills JSON:', e);
            return [];
          }
        },
        set(value) {
          this.setDataValue('weakSkills', value ? JSON.stringify(value) : null);
        },
      },
      questionIds: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of recommended question IDs',
        get() {
          const raw = this.getDataValue('questionIds');
          try {
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            console.error('Error parsing questionIds JSON:', e);
            return [];
          }
        },
        set(value) {
          this.setDataValue('questionIds', value ? JSON.stringify(value) : null);
        },
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Model prediction confidence (0-1)',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true, // Let SQL Server default handle it
        field: 'createdAt',
        comment: 'When this prediction was made',
      },
    },
    {
      sequelize,
      modelName: 'MLPredictionHistory',
      tableName: 'MLPredictionHistory',
      timestamps: false, // Disable Sequelize timestamps, use SQL Server default
      indexes: [
        { fields: ['userId'] },
        { fields: ['createdAt'] },
        { fields: ['userId', 'createdAt'] },
      ],
      comment: 'Tracking table for ML predictions history - INSERT only, no updates',
    }
  );

  return MLPredictionHistory;
};
