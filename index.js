let validator = require('validator');
const bcrypt = require('bcrypt');
let dotenv = require('dotenv');
dotenv.config()
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 5000 || process.env.PORT;
const http = require('http').Server(app);
const socketIO = require('socket.io')(http,{ cors: { origin: "*"} });
app.use(cors());
 
let {connectToDB, insertIntoUsers} = require('./db')

// connect to Elephant SQL database
connectToDB()

socketIO.use((socket, next) => {
  console.log("request received")
  const token = socket.handshake.auth.token;
  console.log(token)
  next();
});

const connectedCliens = []

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected! list of connected clients is -----`);
    connectedCliens.push(socket.id);
    console.log(connectedCliens);
    

    socket.on('disconnect', (socket) => {
      console.log('A user disconnected now list of connected client is ---- ');
      const index = connectedCliens.indexOf(socket.id);
      connectedCliens.splice(index, 1);
      console.log(connectedCliens)
    });

    socket.on('message', (data) => {
      console.log(data);
      socketIO.emit('messageResponse1', {"hello":"this is reply"});
    });


});




app.use(express.json());
app.get('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body
    if(!validator.isEmail(email)){res.status(400).send({"message": "please check email address"})}
    if(!validator.isStrongPassword(password)){res.status(400).send({"message": "password should be strong"})}
    if(!validator.isLength(name, {min : 2, max: 50})){res.status(400).send({"message": "minimum length of name should be 5 and maximum 7"})}  
    let hash = await bcrypt.hash(password, 10)
    console.log(hash)
    let queryResult = await insertIntoUsers(name, email, hash)
    res.json({ message: 'success'});

  }catch(err){
    res.status(500).json({message : "error"})

  }
 
});

let instance = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

socketIO.listen(instance)







/*
Technique 2 (auto-gen a salt and hash):

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
});
Note that both techniques achieve the same end-result.

To check a password:
// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
    // result == true
});
bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
    // result == false
});


 h = hash

       bcrypt.compare(password, h, function(err, result) {
        console.log("password compare result is " + result)
      });




var express = require('express');
var app     = express();
var server  = app.listen(1337);
var io      = require('socket.io').listen(server);





CREATE TABLE IF NOT EXISTS Users (id SERIAL PRIMARY KEY, name varchar(255), email varchar(255), passHash varchar(255))

*/