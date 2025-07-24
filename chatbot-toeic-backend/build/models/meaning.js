'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Meaning extends Model {
    static associate(models) {
      Meaning.belongsTo(models.Vocabulary, {
        foreignKey: 'vocabId',
        as: 'vocabulary'
      });
    }
  }
  Meaning.init({
    vocabId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    partOfSpeech: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Meaning',
    tableName: 'Meanings',
    freezeTableName: true,
    timestamps: false
  });
  return Meaning;
};