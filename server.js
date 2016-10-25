const express = require('express');
const path = require('path');
const app = express(); 
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dethread = require('./dethread.js');


dethread.start(io,['coffee','plz']);





app.use(express.static(path.join(__dirname, '/')));



http.listen(8080, function(e){
  console.log("connected on 8080");
});