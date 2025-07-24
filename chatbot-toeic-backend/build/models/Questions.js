'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.hasMany(models.UserResult, {
        foreignKey: 'questionId',
        as: 'userResults',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Question.belongsTo(models.QuestionType, {
        foreignKey: 'typeId',
        as: 'questionType',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
      Question.belongsTo(models.Part, {
        foreignKey: 'partId',
        as: 'part'
      });
      Question.belongsToMany(models.Test, {
        through: 'TestQuestion',
        foreignKey: 'questionId',
        otherKey: 'testId',
        as: 'tests'
      });
    }
  }
  Question.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: DataTypes.TEXT,
    optionA: DataTypes.STRING,
    optionB: DataTypes.STRING,
    optionC: DataTypes.STRING,
    optionD: DataTypes.STRING,
    correctAnswer: DataTypes.STRING,
    explanation: DataTypes.TEXT,
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'QuestionType',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    partId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Part',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'Questions',
    timestamps: false
  });
  return Question;
};