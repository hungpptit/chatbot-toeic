'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Pronunciation extends Model {
    static associate(models) {
      // Một pronunciation thuộc về một vocabulary
      Pronunciation.belongsTo(models.Vocabulary, {
        foreignKey: 'vocabId',
        as: 'vocabulary',
      });
    }
  }

  Pronunciation.init({
      id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    vocabId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vocabulary', // hoặc 'Vocabulary' tùy bạn đặt tên bảng
        key: 'id',
      },
    },
    accent: {
      type: DataTypes.STRING(10), // 'UK', 'US', 'AU'
    },
    phoneticText: {
      type: DataTypes.STRING(100), // ví dụ: '/həˈləʊ/'
    },
    audioUrl: {
      type: DataTypes.TEXT, // Link file .mp3
    },
  }, {
    sequelize,
    modelName: 'Pronunciation',     
    tableName: 'Pronunciations',     
    freezeTableName: true,
    timestamps: false 
  });

  return Pronunciation;
};
