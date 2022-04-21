import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    letterSpacing: -0.17,
  },
  previewTextRead: {
    color: "#9CADC8",
  },
  previewTextUnread: {
    color: "#000",
    fontWeight: 'bold',
  },
}));

const ChatContent = ({ conversation }) => {
  const classes = useStyles();

  const { otherUser } = conversation;
  const latestMessageText = conversation.id && conversation.latestMessageText;
  const lastIndex = conversation.messages.length - 1;
  const statusRead = 
    conversation.messages.length > 0
    && conversation.messages[lastIndex].senderId === otherUser.id
    ? conversation.messages[lastIndex].statusRead 
    : true;
  const statusReadClass = `${classes.previewText} ${statusRead ? classes.previewTextRead : classes.previewTextUnread}`;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography 
          className={statusReadClass} 
        >
          {latestMessageText}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatContent;
