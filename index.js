let validator = require('validator');
const bcrypt = require('bcrypt');
let dotenv = require('dotenv');
dotenv.config()
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 8080 || process.env.PORT;
const http = require('http').Server(app);
const socketIO = require('socket.io')(http,{ cors: { origin: "*"} });
app.use(cors());




let jwt = require('jsonwebtoken');
 
let {connectToDB, insertIntoUsers, getUserByEmail, insertNewNewsItem, getAllNewsToday, modifyNewsItem, getAllNewsItems, insertComment, getCommentOfNews} = require('./db')

// connect to Elephant SQL database
connectToDB()


// Middleware to attach user object to socket if it has token.
socketIO.use((socket, next) => {
  try {  
  socket.user = {}
  const token = socket.handshake.auth.token;
  if(token != undefined){    
    let decodedInfo = jwt.verify(token, 'secret');   
    socket.user = decodedInfo;
  }
  
  next()

  }catch(err){
    
    next(new Error("Error in decoding token"))
  }
  
})

// Array to have list of connected clients. Not using in this project. just for testing
const connectedCliens = []

// handling all events here
socketIO.on('connection', (socket) => {
    //console.log(`${socket.id} user just connected! list of connected clients is -----`);
    connectedCliens.push(socket.id);
    // console.log(connectedCliens);
    

    socket.on('disconnect', (socket) => {
      //console.log('A user disconnected now list of connected client is ---- ');
      const index = connectedCliens.indexOf(socket.id);
      connectedCliens.splice(index, 1);
      //console.log(connectedCliens)
    });

    socket.on('error', (socket) => {
      //console.log('some error happended  ');
      const index = connectedCliens.indexOf(socket.id);
      connectedCliens.splice(index, 1);
      socket.disconnect()
    
    });

    

    // event listener for getting today's news
    socket.on('todaynews', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          
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

    // handling submission of any new news item
    socket.on('newnewsitem', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          const {title, subtitle, description, uid, name} = data
          
          await insertNewNewsItem(title, subtitle, description, uid, name)
          const result = await getAllNewsToday()    
          callback(result.rows)
          socket.broadcast.emit('updatenews', result.rows);

          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})

      }     
    });


    // handling update of any news item
    socket.on('newsitemupdate', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          const {id, title, subtitle, description} = data
          
          await modifyNewsItem(id, title, subtitle, description)
          const result = await getAllNewsToday()    
          callback(result.rows)
          socket.broadcast.emit('updatenews', result.rows);
          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})

      }     
    });



    //getting comments on a specific post
    socket.on('getcomments', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          const  {news_id, } = data
          
          socket.join(news_id)


        
          const result = await getCommentOfNews(news_id)
          
          callback(result.rows)

          socketIO.to(news_id).emit("commentupdate", result.rows)
          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})
      }       
    });


     // handling addition of any new comment
    socket.on('addnewcomment', async (data, callback) => {
      try {
        if(socket.user.id != undefined){
          const  {news_id, ctext, uid, name } = data     
          
          socket.join(news_id)

          
          await insertComment(ctext, news_id, uid, name)
          const result = await getCommentOfNews(news_id)
          callback(result.rows)

          socketIO.to(news_id).emit("commentupdate", result.rows)
          }
          else {
            callback({"message" : "please login first"})
          }

      }catch(err){
        callback({"message" : err.message})
      }       
    });




    //handle new sign up event 
    socket.on('signup', async (data, callback) => {
      try {      
      const {name, email, password} = data
      let hash = await bcrypt.hash(password, 10)
      await insertIntoUsers(name, email, hash)
      callback({"message":"success", name, email, hash});
      
      }catch(err){
        
        callback({"message":"error", "description": err.message});
        
      }      
    });


    // handle login event here 
    socket.on('login', async (data, callback) => {
      try {   
      const {email, password} = data
      const result = await getUserByEmail(email)      
      const {id, name, passhash} = result.rows[0]
      const match = await bcrypt.compare(password, passhash);
      let token = jwt.sign({ id, name, email }, 'secret');     
        if(match){
          
          callback({"message":"success", token, id, name, email})
          return ;
        } else {
          
          callback({"message":"error"})
          return;
        }     
      
      }catch(err){
        
        callback({"message":"error", "description": err.message})
      }      
    });

});

// starting server
app.use(express.json());
let instance = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
socketIO.listen(instance)


