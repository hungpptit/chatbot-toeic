'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserVocabulary extends Model {
    static associate(models) {
      UserVocabulary.belongsTo(models.User, { foreignKey: 'userId' });
      UserVocabulary.belongsTo(models.Vocabulary, { foreignKey: 'vocabId' });
    }
  }

  UserVocabulary.init({
    userId: DataTypes.INTEGER,
    vocabId: DataTypes.INTEGER,
    reviewCount: DataTypes.INTEGER,
    lastReviewed: DataTypes.DATE,
    isMastered: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'UserVocabulary',
  });

  return UserVocabulary;
};
