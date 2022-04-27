const Sequelize = require("sequelize");
const db = require("../db");

const Group = db.define("group", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  photoUrl: {
    type: Sequelize.STRING
  },
});

module.exports = Group;