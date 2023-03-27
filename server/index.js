const io = require('socket.io')(3000);
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join', (username) => {
    console.log(`User ${username} joined`);
    userSockets.set(username, socket);
  });

  socket.on('message', (data) => {
    console.log(`Received message: ${data}`);

    // Parse the data payload to extract the recipient and message
    const { recipient, message } = JSON.parse(data);

    // Get the recipient's socket from the userSockets Map
    const recipientSocket = userSockets.get(recipient);

    if (recipientSocket) {
      // If the recipient is online, send the message only to them
      recipientSocket.emit('message', message);
    } else {
      // If the recipient is not online, ignore the message
      console.log(`Recipient ${recipient} is not online`);
    }
  });

  socket.on('disconnect', () => {
    // Remove the socket from the userSockets Map when the user disconnects
    for (const [username, userSocket] of userSockets.entries()) {
      if (userSocket === socket) {
        console.log(`User ${username} disconnected`);
        userSockets.delete(username);
        break;
      }
    }
  });
});
