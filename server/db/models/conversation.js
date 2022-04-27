const { Sequelize, Op } = require("sequelize");
const db = require("../db");

const Conversation = db.define("conversation", {
  user1Id: {
    type: Sequelize.INTEGER,
    defaultValue: null,
  },
  user2Id: {
    type: Sequelize.INTEGER,
    defaultValue: null,
  },
  gourpId: {
    type: Sequelize.INTEGER,
    defaultValue: null,
  },
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

Conversation.findGroupConversation = async function (groupId) {
  const conversation = await Conversation.findOne({
    where: {
      groupId: {
        [Op.eq]: groupId
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
