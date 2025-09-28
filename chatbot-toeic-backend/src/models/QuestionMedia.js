'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionMedia extends Model {
    static associate(models) {
      // Một Question có thể có nhiều media
      QuestionMedia.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionMedia.init(
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'audio', 'video'),
        allowNull: false,
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'QuestionMedia',
      tableName: 'QuestionMedia',
      timestamps: false,
    }
  );

  return QuestionMedia;
};
