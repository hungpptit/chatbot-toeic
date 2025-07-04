'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserVocabulary, { foreignKey: 'userId' });
      User.hasMany(models.UserResult, { foreignKey: 'userId' });
      User.hasMany(models.Log, { foreignKey: 'userId' });
    }
  }

  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
