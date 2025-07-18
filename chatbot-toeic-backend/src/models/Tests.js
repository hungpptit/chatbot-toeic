'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {
      Test.belongsToMany(models.Question, {
        through: 'TestQuestions',
        foreignKey: 'testId',
        otherKey: 'questionId',
        as: 'questions',
      });
      Test.belongsToMany(models.Course, {
        through: 'Test_Courses',
        foreignKey: 'testId',    
        otherKey: 'courseId',
        timestamps: false      
      });
      Test.hasMany(models.UserTest, { foreignKey: 'testId' });

    }
  }

  Test.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    duration: DataTypes.STRING,
    participants: DataTypes.INTEGER,
    comments: DataTypes.INTEGER,
   
 
  }, {
    sequelize,
    modelName: 'Test',
    tableName: 'Tests',
    timestamps: false,
  });

  return Test;
};
