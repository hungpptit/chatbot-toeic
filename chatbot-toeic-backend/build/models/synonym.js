'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Synonym extends Model {
    static associate(models) {
      Synonym.belongsTo(models.Vocabulary, {
        foreignKey: 'vocabId',
        as: 'vocabulary'
      });
    }
  }
  Synonym.init({
    vocabId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    synonym: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Synonym',
    tableName: 'Synonyms',
    freezeTableName: true,
    timestamps: false
  });
  return Synonym;
};