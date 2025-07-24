'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Vocabulary extends Model {
    static associate(models) {
      // define association here nếu cần
      Vocabulary.hasMany(models.Pronunciation, {
        foreignKey: 'vocabId',
        as: 'pronunciations'
      });
      Vocabulary.hasMany(models.Synonym, {
        foreignKey: 'vocabId',
        as: 'synonyms'
      });
      Vocabulary.hasMany(models.Antonym, {
        foreignKey: 'vocabId',
        as: 'antonyms'
      });
      Vocabulary.hasMany(models.Meaning, {
        foreignKey: 'vocabId',
        as: 'meanings'
      });
    }
  }
  Vocabulary.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    word: DataTypes.STRING,
    definition: DataTypes.STRING,
    example: DataTypes.STRING,
    topic: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Vocabulary',
    tableName: 'Vocabulary',
    freezeTableName: true,
    timestamps: false
  });
  return Vocabulary;
};