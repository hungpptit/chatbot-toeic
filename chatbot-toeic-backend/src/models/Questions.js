'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Mối quan hệ với bảng Tests
      Question.belongsTo(models.Test, {
        foreignKey: 'testId',
        as: 'test',
      });
      Question.hasMany(models.UserResult, { foreignKey: 'questionId', as: 'userResults' });
    }
  }

  Question.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: DataTypes.TEXT,
    optionA: DataTypes.STRING,
    optionB: DataTypes.STRING,
    optionC: DataTypes.STRING,
    optionD: DataTypes.STRING,
    correctAnswer: DataTypes.STRING,
    explanation: DataTypes.TEXT,
    type: DataTypes.STRING,
    topic: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'Questions',
    timestamps: false,
  });

  return Question;
};
