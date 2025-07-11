'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserResult extends Model {
    static associate(models) {
      UserResult.belongsTo(models.User, { foreignKey: 'userId' });
      UserResult.belongsTo(models.Question, { foreignKey: 'questionId' });
    }
  }

  UserResult.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    answeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'UserResult',
    tableName: 'UserResults',
    timestamps: false,
  });

  return UserResult;
};
