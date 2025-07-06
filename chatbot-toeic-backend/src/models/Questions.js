'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // define association here, nếu cần
    }
  }

 Question.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: DataTypes.TEXT,
  optionA: DataTypes.STRING,
  optionB: DataTypes.STRING,
  optionC: DataTypes.STRING,
  optionD: DataTypes.STRING,
  correctAnswer: DataTypes.STRING,
  explanation: DataTypes.TEXT,
  type: DataTypes.STRING,
  topic: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'Questions', // Để chắc chắn khớp với bảng hiện có
  timestamps: false       // Nếu bảng không có createdAt/updatedAt
});

  return Question;
};
