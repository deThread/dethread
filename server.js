const express = require('express');
const path = require('path');
const App = express(); 
const http = require('http').Server(App);
const io = require('socket.io')(http);

//users reference methods for server side connection
//number open connections 
// client connects => saved to Data Structure ids, incre connect


/*Socket-Pool:
[] ---> contains socketIDS.
socketPool.add() ---> only adds on client connection and taskQueue / FTQ contain no available tasks
if tasks exist, pops from socketPool.
socketPool.remove ---> retrieve socket from connections, distributes new work to that socket, calls something like taskQueue.sendTask().

Connections:
{socketID : socket Object plus our own properties to socket Object}
+ task index
+ userID
connections.add()
connections.remove()
connections.terminate() ----> parameter for one or all users

Task-Queue: Array of Pending Tasks
new TaskQueue ----> optional parameter to define taskQueue 
new TaskQueue -----> push method
TaskQueue.sendTask() ----> return task, increment task index
Task Queue index parameter
maybe a get method for task queue

failedTasks:
[] ----> holds indeces that refer to taskQueue tasks.
failedTasks.push() ---> adds to failedTaskQueue
failedTasks.pop()
failedTask.length
length should be constant time

socket.on('disconnect') ---> 
I. remove from connections object || socket pool.
II. client failed work: references socketPool first.  if socketPool has at least one client, then pop off from socketPool and immediately give that task to that socket.  if there's nothing in the socket pool, then add task to failed tasks.

when a client finishes work || new client joins a running process : 
first check taskQueue to distribute task, if nothing there, check failed task, otherwise push to socketPool
*/

/*Socket-Pool:
[] ---> contains socketIDS.
socketPool.add() ---> only adds on client connection and taskQueue / FTQ contain no available tasks
if tasks exist, pops from socketPool.
socketPool.remove ---> retrieve socket from connections, distributes new work to that socket, calls something like taskQueue.sendTask().
*/

function socketPool() {
  this.poolStore = [];

}

//only adds on client connection and taskQueue / FTQ contain no available tasks 
//if tasks exists, pop from socketPool
socketPool.prototype.addToPool = function() {
}

//retrieve socket from connections, distributes new work to that socket, calls something like taskQueue.sendTask()
socketPool.prototype.remove = function() {
}

//Connections:
/*
{socketID : socket Object plus our own properties to socket Object}
+ task index
+ userID
connections.add()
connections.remove()
connections.terminate() ----> parameter for one or all users
io.httpServer.close();
*/

let container = new Connections;

function socketConnection(io) {
  io.on('connection', (socket) => {

    socket.emit('socket_is_connected','You are connected!');
    container.add(socket); 
    socket.on('disconnect', () => {

    })

  });

}

function Connections() {
  this.socket = io();
  this.connectionStore = {};
  //key is socket id
  //value is socket object 
 
}

connections.prototype.add = function(socket) {
  this.connectionStore[socket.id] = socket; 
}

connections.prototype.remove = function(socket) {
  delete this.connectionStore[socket.id]; 

}

connections.prototype.terminate = function() {

}
  




App.use(express.static(path.join(__dirname, '/')));



App.listen(8080, function(e){
  console.log("connected on 8080");
});