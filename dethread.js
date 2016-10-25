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
    addEvents(socket);
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

function addEvents(socket) {
  for(let event in eventContainer) {
    socket.on(event, eventContainer[event]);
  }
  return socket; 
}

//dethread.on('receieve',() => socket.emit('message'));
//socket.on('recieve', () => socket.emit('message'));
//

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
