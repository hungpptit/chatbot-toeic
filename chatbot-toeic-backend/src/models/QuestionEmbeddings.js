'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionEmbedding extends Model {
    static associate(models) {
      // 1 QuestionEmbedding gắn với 1 Question
      QuestionEmbedding.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionEmbedding.init({
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
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dim: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vector: {
      type: DataTypes.TEXT,   // map NVARCHAR(MAX)
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'QuestionEmbedding',
    tableName: 'QuestionEmbeddings',
    timestamps: false,  // mình có updatedAt riêng rồi
  });

  return QuestionEmbedding;
};
