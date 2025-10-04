'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionMediaMap extends Model {
    static associate(models) {
      // Mỗi mapping thuộc về 1 câu hỏi
      QuestionMediaMap.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Mỗi mapping tham chiếu 1 media gốc
      QuestionMediaMap.belongsTo(models.MediaFiles, {
        foreignKey: 'mediaId',
        as: 'media',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionMediaMap.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Questions',
          key: 'id',
        },
      },
      mediaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'MediaFiles',
          key: 'id',
        },
      },
      startSecond: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      endSecond: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'QuestionMediaMap',
      tableName: 'QuestionMediaMap',
      timestamps: false,
    }
  );

  return QuestionMediaMap;
};
