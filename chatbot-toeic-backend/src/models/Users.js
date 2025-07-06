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
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
   role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1: user, 2: admin
    },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',         
  freezeTableName: true,      
  timestamps: true          
});

  return User;
};
