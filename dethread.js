'use strict';

// ***** Connections constructor *****
function Connections() {
  this.sockets = {};
}

Connections.prototype.add = function (socket) {
  this.sockets[socket.id] = socket;
  this.sockets[socket.id].taskIndex = undefined;
};

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

// ***** SocketPool constructor *****
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

// ***** FailedTasks constructor *****
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

// ***** TaskQueue constructor *****
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

// dethread local variables and functions: handles socket communication and task distribution logic

function distributeTask(socket) {
  if (dethread.taskQueue.index <= dethread.taskQueue.length) {
    socket.emit('startTask', dethread.taskQueue.getTask());
    socket.taskIndex = dethread.taskQueue.index;
    dethread.taskCompletionIndex++;
  } else if (dethread.failedTasks.length) {
    const failedTaskIndex = dethread.failedTasks.pop();
    socket.emit('startTask', dethread.taskQueue.getTask(failedTaskIndex));
    dethread.taskCompletionIndex++;
  } else {
    dethread.socketPool.push(socket);
  }
}

function handleSocket() {
  io.on('connection', (socket) => {
    console.log("event Container 1", eventContainer);
    addEvents(socket);
    console.log("event Container", eventContainer);
    dethread.connections.add(socket);
    distributeTask(socket);

    socket.on('finishTask', () => {
      dethread.taskCompletionIndex--;

      if (!dethread.failedTasks.length && dethread.taskQueue.index === dethread.taskQueue.length && !dethread.taskCompletionIndex) {
        io.emit('processComplete');
      } else { 
        distributeTask(socket);
      }
    });

    socket.on('disconnect', () => {
      const failedTaskIndex = socket.taskIndex;
      const socketPoolIndex = dethread.socketPool.socketPool.indexOf(socket.id);

      if (dethread.socketPoolIndex !== -1) {
        dethread.socketPool.remove(dethread.socketPoolIndex);
      } else if (dethread.socketPool.length) {
        connections[dethread.socketPool.pop()].emit('startWork', dethread.taskQueue.getTask(dethread.failedTaskIndex));
      } else {
        dethread.failedTasks.push(dethread.failedTaskIndex);
        dethread.taskCompletionIndex--;
      }

      dethread.connections.remove(socket);
    });
    console.log('the socket object is : ', socket);
  });
}

function addEvents(socket) {
  for(let event in eventContainer) {
    socket.on(event, eventContainer[event].bind(null, socket));
  }
  return socket; 
}

let eventContainer = {};
let io;
const dethread = {
  connections: undefined,
  socketPool: undefined,
  failedTasks: undefined,
  taskQueue: undefined,
  taskCompletionIndex: undefined,

  on(event, callback) {
    eventContainer[event] = callback;
  },

  start(socketio, tasks) {
    this.connections = new Connections();
    this.socketPool = new SocketPool();
    this.failedTasks = new FailedTasks();
    this.taskQueue = new TaskQueue(tasks);
    this.taskCompletionIndex = 0;
    io = socketio;
    handleSocket();
  },
};


module.exports = dethread;
