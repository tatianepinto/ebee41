import React from 'react';
import { Box, Badge } from '@material-ui/core';
import { BadgeAvatar, ChatContent } from '../Sidebar';
import { makeStyles, styled } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'grab',
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 22,
    padding: '11.1px 8px',
    background: '#3A8DFF',
    color: '#fff',
    fontFamily: `${theme.typography.fontFamily}`,
    fontWeight: 'bold',
    letterSpacing: 0,
  },
}));

const Chat = ({ conversation, setActiveChat }) => {
  const classes = useStyles();
  const { otherUser } = conversation;
  const numUnreadMessage = conversation.messages.filter(
    message => message.statusRead === false && message.senderId === otherUser.id
  )

  const handleClick = async (conversation) => {
    await setActiveChat(conversation.otherUser.username);
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent 
        conversation={conversation} 
        numUnreadMessage={numUnreadMessage.length}
      />
      <StyledBadge badgeContent={numUnreadMessage.length} />
    </Box>
  );
};

export default Chat;
