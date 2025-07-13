'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionType extends Model {
    static associate(models) {
      QuestionType.hasMany(models.Question, { foreignKey: 'typeId', as: 'questions' });
    }
  }

  QuestionType.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'QuestionType',
    tableName: 'QuestionType',
    timestamps: false,
  });

  return QuestionType;
};