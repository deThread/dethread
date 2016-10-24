'use strict';

function Connections() {
  this.sockets = {};
}

Connections.prototype.add = function (socket) {
  this.sockets[socket.id] = socket;
  this.sockets[socket.id].taskId = undefined;
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

SocketPool.prototype.add = function (socketId) {
  this.socketPool.push(socketId);
  this.length++;
};

SocketPool.prototype.remove = function () {
  this.length--;
  return this.socketPool.pop();
};

SocketPool.prototype.removeAll = function () {
  this.socketPool = [];
  this.length = 0;
};

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

TaskQueue.prototype.getTask = function () {
  if (this.index >= this.length) return false;
  return this.taskQueue[this.index++];
};

let connections;
let socketPool;
let failedTasks;
let taskQueue;
let io;

const dethread = {
  start(socketio, tasks) {
    connections = new Connections();
    socketPool = new SocketPool();
    failedTasks = new FailedTasks();
    taskQueue = new TaskQueue(tasks);
    io = socketio;
  },
};


module.exports = dethread;
