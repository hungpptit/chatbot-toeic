'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.hasMany(models.UserResult, {
        foreignKey: 'questionId',
        as: 'userResults',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Question.belongsTo(models.QuestionType, {
        foreignKey: 'typeId',
        as: 'questionType',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
      Question.belongsTo(models.Part, {
        foreignKey: 'partId',
        as: 'part',
      });
      Question.belongsToMany(models.Test, {
        through: 'TestQuestion',
        foreignKey: 'questionId',
        otherKey: 'testId',
        as: 'tests',
      });
      Question.hasOne(models.QuestionEmbedding, {
        foreignKey: 'questionId',
        as: 'embedding',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Question.hasOne(models.QuestionStat, {
        foreignKey: 'questionId',
        as: 'stats',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Question.init(
    {
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
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'QuestionType',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      partId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Part',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'Questions',
      timestamps: false,
    }
  );

  // ✅ Hook: sau khi tạo Question thì tự tạo record QuestionStat
  Question.afterCreate(async (question, options) => {
    await sequelize.models.QuestionStat.create(
      {
        questionId: question.id,
        attempts: 0,
        correct: 0,
        // globalCorrectRate: 0.0,
        medianTimeSeconds: 0.0,
      },
      { transaction: options.transaction } // đảm bảo chạy cùng transaction nếu có
    );
  });

  return Question;
};
