'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class TestQuestion extends Model {
    static associate(models) {
      TestQuestion.belongsTo(models.Test, {
        foreignKey: 'testId',
        as: 'test'
      });
      TestQuestion.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question'
      });
    }
  }
  TestQuestion.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TestQuestion',
    tableName: 'TestQuestions',
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['testId', 'questionId']
    }]
  });
  return TestQuestion;
};