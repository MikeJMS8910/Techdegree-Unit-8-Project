'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Book.init({
    title: {
      type: Model.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          // custom error message
          msg: 'Please provide a value for "title"',
        }
      }
    },
    author: {
      type: Model.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          // custom error message
          msg: 'Please provide a value for "title"',
        }
      }
    },
    genre: {
      type: Model.STRING
    },
    year: {
      type: Model.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};