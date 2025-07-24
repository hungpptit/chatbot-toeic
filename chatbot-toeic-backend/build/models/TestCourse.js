'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class TestCourse extends Model {
    static associate(models) {
      // bảng trung gian, không cần thêm gì ở đây
    }
  }
  TestCourse.init({
    testId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'TestCourse',
    tableName: 'Test_Courses',
    timestamps: false
  });
  return TestCourse;
};