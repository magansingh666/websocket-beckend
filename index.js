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








let jwt = require('jsonwebtoken');
 
let {connectToDB, insertIntoUsers, getUserByEmail, insertNewNewsItem, getAllNewsToday, modifyNewsItem, getAllNewsItems} = require('./db')

// connect to Elephant SQL database
connectToDB()



socketIO.use((socket, next) => {
  try {  
  socket.user = {}
  const token = socket.handshake.auth.token;
  if(token != undefined){    
    let decodedInfo = jwt.verify(token, 'secret');   
    socket.user = decodedInfo;
  }
 // console.log("decoded user is")
  //console.log(socket.user)  
  next()

  }catch(err){
    console.log(err.message)
    next(new Error("Error in decoding token"))
  }
  
})


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





    socket.on('message', async (data, callback) => {
      if(socket.user.id != undefined){
      console.log("verified user we are sending reply");
      console.log(socket.user)
      callback(socket.user)
      }
      else {
        callback({"message" : "please login first"})
      }
      
    });


    socket.on('todaynews', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          console.log("we are sending all news items of today ");
          const result = await getAllNewsToday()    
          callback(result.rows)
          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})

      }  
      
    });


    socket.on('newnewsitem', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          const {title, subtitle, description} = data
          console.log("new news item is being created ....\n\n\n\n\n\n");
          await insertNewNewsItem(title, subtitle, description)
          const result = await getAllNewsToday()    
          callback(result.rows)
          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})

      }  
      
    });




    //handle new sign up event
    socket.on('signup', async (data) => {
      try {      
      const {name, email, password} = data
      let hash = await bcrypt.hash(password, 10)
      let queryResult = await insertIntoUsers(name, email, hash)
      socketIO.to(socket.id).emit('signupResponse', {"message":"success", name, email, hash});
      }catch(err){
        socketIO.to(socket.id).emit('signupResponse', {"message":"error", "description": err.message});
      }      
    });


    // handle login event here 
    socket.on('login', async (data) => {
      try {   
      const {email, password} = data
      const result = await getUserByEmail(email)      
      const {id, name, passhash} = result.rows[0]
      const match = await bcrypt.compare(password, passhash);
      let token = jwt.sign({ id, name, email }, 'secret');     
        if(match){
          socketIO.to(socket.id).emit('loginResponse', {"message":"success", token, id, name, email});
          return ;
        } else {
          socketIO.to(socket.id).emit('loginResponse', {"message":"error"});
          return;
        }     
      
      }catch(err){
        socketIO.to(socket.id).emit('loginResponse', {"message":"error", "description": err.message});
      }      
    });

});

app.use(express.json());
let instance = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
socketIO.listen(instance)







/*

app.post('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body
    if(!validator.isEmail(email)){res.status(400).send({"message": "please check email address"})}
    if(!validator.isStrongPassword(password)){res.status(400).send({"message": "password should be strong"})}
    if(!validator.isLength(name, {min : 2, max: 50})){res.status(400).send({"message": "minimum length of name should be 5 and maximum 7"})}  
    let hash = await bcrypt.hash(password, 10)
    let queryResult = await insertIntoUsers(name, email, hash)
    res.status(200).json({ message: 'success'});
  }catch(err){
    res.status(500).json({message : "error"})
  } 
});


app.post('/login', async (req, res) => {
  try {
  const {email, password} = req.body
  const result = await getUserByEmail(email)
  console.log(result.rows[0])
  
  if(result.rows[0] == undefined){
    res.status(400).send({message : "error in email address"})
  }
  const {id, name} = result.rows[0]
  let token = jwt.sign({ id, name, email }, 'secret');
 

  res.send({message : "success", token})

  }catch(err){
    res.status(400).send({message : err.message})

  }



  
});



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