/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const socket: Socket = io('http://localhost:3000');

type ChatMessage = {
  sender: string;
  message: string;
  timestamp: number;
};

const ChatApp = () => {
  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [receivedMsg, setReceivedMsg] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);


  useEffect(() => {
    // Use the useEffect hook to join the server with the username and retrieve chat history
    joinServerWithUsername(socket, name); // call the function with the username

    // Listen for incoming messages from the server
    socket.on('message', (data: string) => {
      try {
        console.log("===================");
        console.log(data);
        const { sender, message, timestamp } = JSON.parse(data);
        setReceivedMsg(prevReceivedMsg => [...prevReceivedMsg, { sender, message, timestamp }]);
      } catch (error) {
        console.error(`Error parsing message: ${data}`, error);
      }
    });

    // retrieve chat history from local storage
    retrieveChatHistory();

    // Disconnect from the server on component unmount
    return () => {
      socket.disconnect();
    };
  }, [name]); // call the function whenever the username changes

  // Define a function to retrieve chat history from AsyncStorage
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

  // function to handle sending message
  const handleSend = async () => {
    if (name && message) { // check if name and message are not empty
      const timestamp = Date.now(); // get current timestamp
      const data = { sender: name, message, recipient, timestamp }; // create message object
      socket.emit('message', JSON.stringify(data)); // emit 'message' event with the message object to server

      const updatedChat = [...chat, { ...data }];
      setChat(updatedChat); // update the chat state
      setMessage(''); // clear the message input field
      try {
        await AsyncStorage.setItem('chat_history', JSON.stringify(updatedChat)); // store updated chat history to local storage
        console.log('Chat history stored');
      } catch (error) {
        console.log(error);
      }
    }
  };


  const { container, textContainer, text, textInputContainer, safeAreaContainer, inputStyle, receivedContainer, inputContainer, nameInput, recipientText } = styles;

  // sort messages by timestamp, oldest to newest
  const sortedMessages = [...chat, ...receivedMsg].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <>
      <SafeAreaView style={safeAreaContainer}>
        <View
        style={container}>
          <Text style={{color: 'black', fontSize: 27, textAlign: 'center', marginTop: 20}}>Chats</Text>
          <FlatList
            data={sortedMessages}
            renderItem={({ item }) => {
              return (
                <View style={item.sender === name ? textContainer : receivedContainer}>
                  <Text style={item.sender === name ? text : recipientText }>{item.sender}: {item.message}</Text>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={textInputContainer}>
            <View style={inputContainer}>
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#A9A9A9"
                style={[inputStyle, nameInput]}
                value={name}
                onChangeText={(username) => setName(username)}
              />

              <TextInput
                placeholder="Enter your recipient"
                placeholderTextColor="#A9A9A9"
                style={[inputStyle, nameInput]}
                value={recipient}
                onChangeText={(recipientName) => setRecipient(recipientName)}
              />
            </View>
            <TextInput
              placeholder="Enter your message"
              placeholderTextColor="#A9A9A9"
              value={message}
              style={inputStyle}
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
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
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
    color: '#000000',
  },
  textInputContainer: {
    marginTop: 30,
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: '#B2BEB5',
    marginBottom: 10,
    width: '80%',
    paddingHorizontal: 10,
    color: '#000000',
    borderRadius: 6,
    paddingVertical: 15,
  },
  receivedContainer: {
    backgroundColor: '#0B2447',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: '65%',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '90%',
  },
  nameInput: {
    width: '48%',
  },
  recipientText: {
    color: 'white',
    fontSize: 20,
  },
});

export default ChatApp;
