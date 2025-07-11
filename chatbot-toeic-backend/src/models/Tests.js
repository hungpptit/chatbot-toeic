'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {
      Test.hasMany(models.Question, { foreignKey: 'testId' });
      Test.belongsToMany(models.Course, { through: 'Test_Courses', foreignKey: 'testId' });
    }
  }

  Test.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    duration: DataTypes.STRING,
    participants: DataTypes.INTEGER,
    comments: DataTypes.INTEGER,
    questions: DataTypes.INTEGER,
    parts: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Test',
    tableName: 'Tests',
    timestamps: false,
  });

  return Test;
};
