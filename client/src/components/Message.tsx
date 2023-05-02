import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [receivedMessage, setReceivedMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = () => {
    if (socket) {
      socket.emit('join', username);
    }
  };

  const handleMessage = () => {
    if (socket) {
      const data = JSON.stringify({
        recipient: 'recipient_username',
        message,
      });
      socket.emit('message', data);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: string) => {
        setReceivedMessage(message);
      });
    }
  }, [socket]);

  return (
    <View style={{ padding: 20, paddingTop: 55 }}>
      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        style={{ marginBottom: 20 }}
      />
      <TouchableOpacity onPress={handleJoin}>
        <Text>Join</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Enter message"
        value={message}
        onChangeText={setMessage}
        style={{ marginTop: 20, marginBottom: 20 }}
      />
      <TouchableOpacity onPress={handleMessage}>
        <Text>Send</Text>
      </TouchableOpacity>
      {receivedMessage && (
        <Text style={{ marginTop: 20 }}>Received message: {receivedMessage}</Text>
      )}
    </View>
  );
};

export default App;
