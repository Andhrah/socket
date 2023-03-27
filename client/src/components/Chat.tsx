/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const socket: Socket = io('http://localhost:3000');

const ChatApp = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<(string | { sender: string, message: string })[]>([]);


  useEffect(() => {
    joinServerWithUsername(socket, name); // call the function with the username

    socket.on('message', (data: string) => {
      setChat((prevChat: (string | { sender: string; message: string; })[]) => [...prevChat, data]);
    });

    // retrieve chat history from local storage
    retrieveChatHistory();

    return () => {
      socket.disconnect();
    };
  }, [name]); // call the function whenever the username changes

  const retrieveChatHistory = async () => {
    try {
      const storedChat = await AsyncStorage.getItem('chat_history');
      if (storedChat !== null) {
        setChat(JSON.parse(storedChat));
      }
    } catch (error) {
      console.log(error);
    }
  };


  const joinServerWithUsername = async (socket: Socket, username: string) => { // take the username as an argument
    try {
      await AsyncStorage.setItem('username', username); // store the username in AsyncStorage
      socket.emit('join', username);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async () => {
    if (name && message) {
      const data = { sender: name, message, recipient: 'all' };
      socket.emit('message', JSON.stringify(data));

      const updatedChat = [...chat, data];
      setChat(updatedChat);
      try {
        await AsyncStorage.setItem('chat_history', JSON.stringify(chat));
        console.log('Chat history stored');
      } catch (error) {
        console.log(error);
      }
      setMessage('');
    }
  };

  const { container, textContainer, text, textInputContainer } = styles;

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View
        style={container}>
          <FlatList
            data={chat}
            renderItem={({ item }) => {
              if (typeof item === 'string') {
                return (
                  <View style={textContainer}>
                    <Text style={text}>{item}</Text>
                  </View>
                );
              } else {
                return (
                  <View style={textContainer}>
                    <Text style={text}>{item.sender}: {item.message}</Text>
                  </View>
                );
              }
            }}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={textInputContainer}>
            <TextInput
              placeholder="Enter your name"
              value={name}
              onChangeText={(username) => setName(username)}
            />
            <TextInput
              placeholder="Enter your message"
              value={message}
              onChangeText={(textMessage) => setMessage(textMessage)}
            />
            <Button title="Send" onPress={handleSend} />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    backgroundColor: 'cyan',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: '65%',
  },
  text: {
    fontSize: 20,
  },
  textInputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default ChatApp;
