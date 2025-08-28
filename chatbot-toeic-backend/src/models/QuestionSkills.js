'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionSkill extends Model {
    static associate(models) {
      // Một QuestionSkill thuộc về một Question
      QuestionSkill.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Một QuestionSkill thuộc về một Skill
      QuestionSkill.belongsTo(models.Skill, {
        foreignKey: 'skillId',
        as: 'skill',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionSkill.init({
    questionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    skillId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Skills',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    weight: {
      type: DataTypes.DECIMAL(3,2),
      defaultValue: 1.0,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'QuestionSkill',
    tableName: 'QuestionSkills',
    timestamps: false,
  });

  return QuestionSkill;
};
