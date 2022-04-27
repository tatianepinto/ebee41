const router = require("express").Router();
const { Message } = require("../../db/models");

// expects { messageId }
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { messageId, otherUserId } = req.body;

    //Change statusRead to true
    const confirm = await Message.update({ statusRead: true }, {
      where: {
        id: messageId
      }
    });

    if(confirm[0] === 1)
      res.json({ otherUserId: otherUserId, messageIdRead: messageId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;