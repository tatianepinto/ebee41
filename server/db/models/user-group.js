const { Sequelize, Op } = require("sequelize");
const db = require("../db");

const UserGroup = db.define("user-group", {});

// find users and groups given two user or group Ids

UserGroup.findGroupsByUser = async function (userId) {
  const groups = await UserGroup.findAll({
    where: {
        userId: {
        [Op.eq]: userId
      }
    }
  });

  // return conversation or null if it doesn't exist
  return groups;
};

UserGroup.findUsersByGroup = async function (groupId) {
    const users = await UserGroup.findAll({
      where: {
        groupId: {
          [Op.eq]: groupId
        }
      }
    });
  
    // return conversation or null if it doesn't exist
    return users;
  };

module.exports = UserGroup;
