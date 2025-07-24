'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Antonym extends Model {
    static associate(models) {
      Antonym.belongsTo(models.Vocabulary, {
        foreignKey: 'vocabId',
        as: 'vocabulary'
      });
    }
  }
  Antonym.init({
    vocabId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    antonym: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Antonym',
    tableName: 'Antonyms',
    freezeTableName: true,
    timestamps: false
  });
  return Antonym;
};