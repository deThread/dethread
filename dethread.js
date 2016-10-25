'use strict';

function Connections() {
  this.sockets = {};
}

Connections.prototype.add = function (socket) {
  this.sockets[socket.id] = socket;
  this.sockets[socket.id].taskIndex = undefined;
};

// remove happens when theres a disconnection
Connections.prototype.remove = function (socket) {
  if (!this.sockets[socket.id]) return false;
  delete this.sockets[socket.id];
};

Connections.prototype.terminateAll = function () {
  for (let socketId in this.sockets) {
    this.sockets[socketId].disconnect();
  }
  this.sockets = {};
};

function SocketPool() {
  this.socketPool = [];
  this.length = 0;
}

SocketPool.prototype.push = function (socket) {
  socket.taskIndex = undefined;
  this.socketPool.push(socket.id);
  this.length++;
};

SocketPool.prototype.pop = function () {
  this.length--;
  return this.socketPool.pop();
};

SocketPool.prototype.removeAll = function () {
  this.socketPool = [];
  this.length = 0;
};

SocketPool.prototype.remove = function (socketIndex) {
  this.socketPool.splice(socketIndex, 1);
  this.length--;
}

function FailedTasks() {
  this.failedTasks = [];
  this.length = 0;
}

FailedTasks.prototype.push = function (index) {
  this.failedTasks.push(index);
  this.length++;
};

FailedTasks.prototype.pop = function () {
  this.length--;
  return this.failedTasks.pop();
};

function TaskQueue(array) {
  if (!Array.isArray(array)) throw new Error('TaskQueue parameter must be an array.');
  else {
    this.taskQueue = array;
    this.length = array.length;
    this.index = 0;
  }
}

TaskQueue.prototype.getTask = function (failedIndex) {
  if (failedIndex) return this.taskQueue[failedIndex];
  if (this.index >= this.length) return false;
  return this.taskQueue[this.index++];
};

let connections;
let socketPool;
let failedTasks;
let taskQueue;
let io;
let taskCompletionIndex;

function distributeTask(socket) {
  if (taskQueue.index <= taskQueue.length) {
    socket.emit('startTask', taskQueue.getTask());
    socket.taskIndex = taskQueue.index;
    taskCompletionIndex++;
  } else if (failedTasks.length) {
    const failedTaskIndex = failedTasks.pop();
    socket.emit('startTask', taskQueue.getTask(failedTaskIndex));
    taskCompletionIndex++;
  } else {
    socketPool.push(socket);
  }
}

function handleSocket() {
  io.on('connection', (socket) => {
    console.log('socket io connect');
    connections.add(socket);
    distributeTask(socket);
    
    socket.on('finishTask', () => {
      taskCompletionIndex--;
      if (!failedTasks.length && taskQueue.index === taskQueue.length && !taskCompletionIndex) {
        io.emit('processComplete');
      } else { 
        distributeTask(socket);
      }
    });

    socket.on('disconnect', () => {
      const failedTaskIndex = socket.taskIndex;
      const socketPoolIndex = socketPool.indexOf(socket.id);
      if (socketPoolIndex !== -1) {
        socketPool.remove(socketPoolIndex);
      } else if (socketPool.length) {
        connections[socketPool.pop()].emit('startWork', taskQueue.getTask(failedTaskIndex));
      } else {
        failedTasks.push(failedTaskIndex);
        taskCompletionIndex--;
      }
      connections.remove(socket);
    });
  });
}

const dethread = {
  start(socketio, tasks) {
    connections = new Connections();
    socketPool = new SocketPool();
    failedTasks = new FailedTasks();
    taskQueue = new TaskQueue(tasks);
    io = socketio;
    taskCompletionIndex = 0;
    handleSocket();
  },
};


module.exports = dethread;
