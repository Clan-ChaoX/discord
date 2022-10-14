const { io } = require("socket.io-client");

const socket = io("https://api.d2chx.com/api/v1");

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", () => {
  console.log("Lost connection to api.d2chx.com!");
});

socket.io.on("error", (error) => {
  console.log(error);
});

socket.on("newGameChannel"),
  (game) => {
    console.log(`New Game Created ${game}`);
    // Ping Game Type Role for new game
  };

socket.on("endGameChannel"),
  () => {
    // write game duration to session counter
  };

socket.on("runnerLoginChannel"),
  () => {
    // Add user to current session counter
  };

socket.on("runnerLogoutChannel"),
  () => {
    // Calculate runs this session and announce thank you
    // remove user from session counter
  };
