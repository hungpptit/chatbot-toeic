'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {
      // Skill có thể có nhiều Question (thông qua bảng trung gian QuestionSkills)
      Skill.belongsToMany(models.Question, {
        through: 'QuestionSkills',
        foreignKey: 'skillId',
        otherKey: 'questionId',
        as: 'questions',
      });

      // Phân cấp: 1 skill có thể có nhiều skill con
      Skill.hasMany(models.Skill, {
        foreignKey: 'parentId',
        as: 'children',
      });

      // Phân cấp: 1 skill có thể có 1 skill cha
      Skill.belongsTo(models.Skill, {
        foreignKey: 'parentId',
        as: 'parent',
      });
    }
  }

  Skill.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Skills',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Skill',
    tableName: 'Skills',
    timestamps: false,
  });

  return Skill;
};
