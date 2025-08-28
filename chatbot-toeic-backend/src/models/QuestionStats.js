'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionStat extends Model {
    static associate(models) {
      // 1 QuestionStat gắn với 1 Question
      QuestionStat.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionStat.init({
    questionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    correct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    globalCorrectRate: {
      // Trong SQL Server bạn có computed column,
      // nhưng trong Sequelize chỉ map ra để đọc
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    medianTimeSeconds: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'QuestionStat',
    tableName: 'QuestionStats',
    timestamps: false,
  });

  return QuestionStat;
};
