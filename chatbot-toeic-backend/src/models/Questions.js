'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // define association here, nếu cần
    }
  }

  Question.init({
    question: DataTypes.TEXT,
    optionA: DataTypes.STRING,
    optionB: DataTypes.STRING,
    optionC: DataTypes.STRING,
    optionD: DataTypes.STRING,
    correctAnswer: DataTypes.STRING,
    explanation: DataTypes.TEXT,
    type: DataTypes.STRING,
    topic: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Question',
  });

  return Question;
};
