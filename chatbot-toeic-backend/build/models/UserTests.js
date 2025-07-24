'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class UserTest extends Model {
    static associate(models) {
      UserTest.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      UserTest.belongsTo(models.Test, {
        foreignKey: 'testId'
      });
      UserTest.hasMany(models.UserResult, {
        foreignKey: 'userTestId'
      });
    }
  }
  UserTest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tests',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('unfinished', 'completed'),
      defaultValue: 'unfinished'
    }
  }, {
    sequelize,
    modelName: 'UserTest',
    tableName: 'UserTests',
    timestamps: false
  });
  return UserTest;
};