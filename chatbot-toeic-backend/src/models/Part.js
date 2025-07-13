'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Part extends Model {
    static associate(models) {
      Part.hasMany(models.Question, { foreignKey: 'partId', as: 'questions' });
    }
  }

  Part.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Part',
    tableName: 'Part',
    timestamps: false,
  });

  return Part;
};
