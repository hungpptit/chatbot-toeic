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
    userId: DataTypes.INTEGER,
    questionId: DataTypes.INTEGER,
    isCorrect: DataTypes.BOOLEAN,
    answeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'UserResult',
  });

  return UserResult;
};
