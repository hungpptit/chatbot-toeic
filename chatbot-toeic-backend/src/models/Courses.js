'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsToMany(models.Test, {
        through: 'Test_Courses',
        foreignKey: 'courseId',   
        otherKey: 'testId',
        timestamps: false        
      });
    }
  }
  Course.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'Courses',
    timestamps: false,
  });
  return Course;
};
