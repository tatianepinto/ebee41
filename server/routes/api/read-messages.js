const router = require("express").Router();
const { Message, Conversation } = require("../../db/models");

// expects { messageId }
router.patch("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { messageId, otherUserId, userId, conversationId } = req.body;

    const conversation = await Conversation.findConversation(
      otherUserId,
      userId
    );
    
    if(conversationId === conversation.id){
      //Change statusRead to true
      const confirm = await Message.update({ statusRead: true }, {
        where: {
          id: messageId
        }
      });

      if(confirm[0] === 1)
        res.json({ otherUserId: otherUserId, messageIdRead: messageId });
    } else return res.sendStatus(401);
  } catch (error) {
    next(error);
  }
});

module.exports = router;