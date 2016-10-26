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
  socket.taskIndexArray = [];
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
  socket.taskIndexArray = [];
  for (let i = 0; i < socket.workers; i++){
    if (dethread.taskQueue.index <= dethread.taskQueue.length) {
      socket.emit('startTask', dethread.taskQueue.getTask());
      socket.taskIndexArray.push(dethread.taskQueue.index);
      dethread.taskCompletionIndex++;
    } else if (dethread.failedTasks.length) {
      const failedTaskIndex = dethread.failedTasks.pop();
      socket.emit('startTask', dethread.taskQueue.getTask(failedTaskIndex));
      socket.taskIndexArray.push(failedTaskIndex);
      dethread.taskCompletionIndex++;
    } else if (!socket.taskIndexArray.length) {
      dethread.socketPool.push(socket);
    }
  }
}
function closeProcess() {
  io.emit('processComplete');
  io.close();
  dethread.start();
}

function handleSocket() {
  io.on('connection', (socket) => {
    addEvents(socket);
    dethread.connections.add(socket);
    distributeTask(socket);

    socket.on('numberOfCores', (workers) => {
      socket.workers = workers;
    });

    socket.on('processComplete', closeProcess);

    socket.on('finishTask', (taskComplete) => {
      dethread.taskCompletionIndex--;
      const index = taskIndexArray.indexOf(taskComplete);
      socket.taskIndexArray.splice(index, 1);
      if (!dethread.failedTasks.length && dethread.taskQueue.index === dethread.taskQueue.length && !dethread.taskCompletionIndex) {
        closeProcess();
      } else if (!socket.taskIndexArray.length) { 
        distributeTask(socket);
      }
    });

    socket.on('disconnect', () => {
      const failedTaskIndeces = socket.taskIndexArray;
      const socketPoolIndex = dethread.socketPool.socketPool.indexOf(socket.id);

      if (dethread.socketPoolIndex !== -1) {
        dethread.socketPool.remove(dethread.socketPoolIndex);
      } else {
        dethread.failedTasks.push(...failedTaskIndeces);
        dethread.taskCompletionIndex -= failedTaskIndeces.length;
        if (dethread.socketPool.length) {
          distributeTask(dethread.connections[dethread.socketPool.pop()]);
        }
      } 
      dethread.connections.remove(socket);
    });
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
