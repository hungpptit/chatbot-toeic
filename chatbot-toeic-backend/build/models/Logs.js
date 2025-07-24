'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Log extends Model {
    static associate(models) {
      Log.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }
  Log.init({
    userId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    response: DataTypes.TEXT,
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Log'
  });
  return Log;
};