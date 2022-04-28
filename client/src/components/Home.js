import React, { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Grid, CssBaseline, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SidebarContainer } from '../components/Sidebar';
import { ActiveChat } from '../components/ActiveChat';
import { SocketContext } from '../context/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post('/api/messages', body);
    return data;
  };

  const saveReadMessage = async (body) => {
    const { data } = await axios.patch('/api/read-messages', body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit('new-message', {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = useCallback(
    (data) => {
      const messageIdRead = data.messageIdRead;
      const otherUserId = data.otherUserId;
      setConversations((prev) =>
        prev.map((convo) => {
          const convoCopy = { ...convo, messages: [...convo.messages] }
          const indexMessages = convoCopy.messages.findIndex(message => message.id === messageIdRead);
          if (indexMessages === -1) return convo;
          else if (convo.otherUser.id === otherUserId) {
            if(convoCopy.numUnreadMessage > 0) convoCopy.numUnreadMessage -= 1;
            if(convoCopy.unreadMessages) convoCopy.unreadMessages = convoCopy.unreadMessages.filter(unreadMessage => { return unreadMessage.id !== messageIdRead });
          } else convoCopy.latestReadMessageId = messageIdRead;
          convoCopy.messages.at(indexMessages).statusRead = true;
          return convoCopy;
        })
      );
    },
    []
  );

  const readMessage = useCallback( (data) => {
    socket.emit('read-message', {
      conversationId: data.conversationId,
      userId: data.userId,
      otherUserId: data.otherUserId,
      messageIdRead: data.messageIdRead,
    });
  }, [socket]);

  const postReadMessage = useCallback( async (body) => {
    try {
      const data = await saveReadMessage(body);

      markAsRead(data);

      readMessage(data);
    } catch (error) {
      console.error(error);
    }
  }, [markAsRead, readMessage]);

  const addNewConvo = useCallback(
    (recipientId, message) => {
      setConversations((prev) =>
        prev.map((convo) => {
          if (convo.otherUser.id === recipientId) {
            convo.messages.push(message);
            convo.latestMessageText = message.text;
            if (message.senderId === recipientId) {
              convo.unreadMessages.push(message);
              convo.numUnreadMessage = 1;
            }
            convo.id = message.conversationId;
            const convoCopy = { ...convo, messages: [...convo.messages] }
            return convoCopy;
          } else return convo;
        })
      );
    },
    []
  );

  const addMessageToConversation = useCallback(
    async (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender } = data;
      const userId = user.id;
      if (message.senderId === userId) {
        //Message comes from input
        setConversations((prev) =>
          prev.map((convo) => {
            if (convo.id === message.conversationId) {
              convo.messages.push(message);
              convo.latestMessageText = message.text;
              const convoCopy = { ...convo, messages: [...convo.messages] }
              return convoCopy;
            } else return convo;
          })
        );
      } else {
        //Message comes from Socket
        const messagesToRead = [];
        const convoUser = conversations.findIndex(
          convo =>
            convo.otherUser.id === message.senderId
        );
        if(sender.id !== userId && convoUser === -1) {
          const newConvo = { 
            activeConversation: false,
            id: message.conversationId, 
            latestMessageText: message.text,
            messages: [message],
            numUnreadMessage: 1,
            otherUser: sender,
            unreadMessages: [message],
          };
          setConversations((prev) => [newConvo, ...prev]);
        } else {
          setConversations((prev) =>
            prev.map((convo) => {
              if (convo.id === message.conversationId) {
                convo.messages.push(message);
                convo.latestMessageText = message.text;
                if (convo.otherUser.id === message.senderId) {
                  if (!convo.activeConversation) {
                    convo.unreadMessages.push(message);
                    convo.numUnreadMessage += 1;
                  } else messagesToRead.push(message);
                }
                const convoCopy = { ...convo, messages: [...convo.messages] }
                return convoCopy;
              } else return convo;
            })
          );
        }
        if(messagesToRead.length > 0) await postReadMessage({ 
          conversationId: messagesToRead.at(0).conversationId,
          userId: userId,
          otherUserId: messagesToRead.at(0).senderId,
          messageId: messagesToRead.at(0).id, 
        }); 
      }
    },
    [conversations, user, postReadMessage]
  );

  const setActiveChat = (username) => {
    setActiveConversation(username);
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.username === username)
          convo.activeConversation = true;
        else convo.activeConversation = false;
        return convo;
      })
    );
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on('add-online-user', addOnlineUser);
    socket.on('remove-offline-user', removeOfflineUser);
    socket.on('new-message', addMessageToConversation);
    socket.on('read-message', markAsRead);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', addMessageToConversation);
      socket.off('read-message', markAsRead);
    };
  }, [markAsRead, addMessageToConversation, addOnlineUser, removeOfflineUser, socket]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push('/login');
      else history.push('/register');
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/conversations');
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          postReadMessage={postReadMessage}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
