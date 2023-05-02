const io = require('socket.io')(3000);
const activeConnections = [];

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join', (username) => {
    console.log(`User ${username} joined`);
    activeConnections.push({ username, socket });
  });

  socket.on('message', (data) => {
    try {
      console.log(`Received message: ${data}`);

      // Parse the data payload to extract the recipient and message
      const { recipient, message } = JSON.parse(data);

      // Get the recipient's socket from the activeConnections array
      const recipientConnection = activeConnections.find(
        (connection) => connection.username === recipient
      );

      if (recipientConnection) {
        // If the recipient is online, send the message only to them
        recipientConnection.socket.emit('message', data);
      } else {
        // If the recipient is not online, ignore the message
        console.log(`Recipient ${recipient} is not online`);
      }
    } catch (error) {
      console.error(`Error parsing message: ${data}`, error);
    }
  });

  socket.on('disconnect', () => {
    // Remove the connection from the activeConnections array when the user disconnects
    const index = activeConnections.findIndex(
      (connection) => connection.socket === socket
    );

    if (index !== -1) {
      const { username } = activeConnections[index];
      console.log(`User ${username} disconnected`);
      activeConnections.splice(index, 1);
    }
  });
});
