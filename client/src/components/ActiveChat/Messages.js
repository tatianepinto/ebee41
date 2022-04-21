import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const { messages, otherUser, userId, postMessage } = props;
  const lastMessageId = () => {
    const checkMessages = [...messages];
    const reversed = checkMessages.reverse();
    return reversed.find(message => {
      if (message.senderId !== otherUser.id) return message;
    });
  };

  const markMessagesAsRead = () => {
    const checkMessages = [...messages];
    const reversed = checkMessages.reverse();
    reversed.forEach(async message => {
      if (!message.statusRead && message.senderId !== userId)
        await postMessage({ otherUserId: otherUser.id, messageId: message.id });
      else return;
    });
  };

  useEffect(() => {
    markMessagesAsRead();
    // eslint-disable-next-line 
  }, [messages]);

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
            statusRead={message.statusRead}
            lastMessageId={message.id === lastMessageId().id ? lastMessageId().id : null}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
