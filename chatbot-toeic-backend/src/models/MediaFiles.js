'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MediaFiles extends Model {
    static associate(models) {
      // Một media có thể được dùng cho nhiều câu hỏi
      MediaFiles.hasMany(models.QuestionMediaMap, {
        foreignKey: 'mediaId',
        as: 'questionMappings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  MediaFiles.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'audio', 'video'),
        allowNull: false,
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MediaFiles',
      tableName: 'MediaFiles',
      timestamps: false,
    }
  );

  return MediaFiles;
};
