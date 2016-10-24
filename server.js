const express = require('express');
const path = require('path');
const App = express(); 
const http = require('http').Server(App);
const io = require('socket.io')(http);
const dethread = require('./dethread.js');












App.use(express.static(path.join(__dirname, '/')));



App.listen(8080, function(e){
  console.log("connected on 8080");
});