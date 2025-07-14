'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserVocabulary, { foreignKey: 'userId' });
      User.hasMany(models.UserResult, { foreignKey: 'userId' });
      User.hasMany(models.Log, { foreignKey: 'userId' });
      User.hasMany(models.UserTest, { foreignKey: 'userId' });

    }
  }

  User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: false,
});


  return User;
};
