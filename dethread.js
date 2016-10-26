'use strict';

let localTasks;
let localClientInit;

// ***** Connections constructor *****
function Connections() {
  this.sockets = {};
}

Connections.prototype.add = function (socket) {
  socket.taskIndex = [];
  this.sockets[socket.id] = socket;
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
  array = array || [];
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
  console.log('dethread.failedTasks', dethread.failedTasks, 'task index array', socket.taskIndexArray);
  socket.taskIndexArray = [];
  for (let i = 0; i < socket.workers; i++){
    if (dethread.taskQueue.index < dethread.taskQueue.length) {
      socket.taskIndexArray.push(dethread.taskQueue.index);
      socket.emit('startTask', dethread.taskQueue.getTask());
      dethread.taskCompletionIndex++;
    } else if (dethread.failedTasks.length) {
      const failedTaskIndex = dethread.failedTasks.pop();
      socket.taskIndexArray.push(failedTaskIndex);
      socket.emit('startTask', dethread.taskQueue.getTask(failedTaskIndex));
      dethread.taskCompletionIndex++;
    } else if (!socket.taskIndexArray.length) {
      dethread.socketPool.push(socket);
    }
  }
}

function closeProcess(data) {
  io.emit('processComplete', data);
  console.log('process complete', data);
  // io.close();
  console.log("The first item is localTasks, localClientInit", localTasks, localClientInit);
  dethread.failedTasks = new FailedTasks();
  console.log('inside closeProcess', dethread.failedTasks);
  dethread.start(io, localTasks, localClientInit);
}

function handleSocket(clientInit) {
  io.on('connection', (socket) => {
    addEvents(socket);
    dethread.connections.add(socket);

    socket.emit('clientInit', clientInit);

    socket.on('clientReady', (workers) => {
      console.log('client ready:', socket.id);
      socket.workers = +workers;
      console.log('there are ', socket.workers, ' number of workers')
      distributeTask(socket);
    });

    socket.on('processComplete', closeProcess);

    socket.on('finishTask', (taskComplete) => {
      dethread.taskCompletionIndex--;
      const index = socket.taskIndexArray.indexOf(taskComplete);
      socket.taskIndexArray.splice(index, 1);
      // TODO: when server completes all tasks, server should store result
      // TODO: pass data to closeProcess when server finishes (130)?
      if (!dethread.failedTasks.length && (dethread.taskQueue.index === dethread.taskQueue.length) && !dethread.taskCompletionIndex) {
        closeProcess();
      } else if (!socket.taskIndexArray.length) {
        console.log('dethread.failedTasks', dethread.failedTasks, 'dethread.taskCompletionIndex', dethread.taskCompletionIndex);
        distributeTask(socket);
      }
    });

    socket.on('disconnect', () => {
      const failedTaskIndeces = socket.taskIndexArray || [];
      const socketPoolIndex = dethread.socketPool.socketPool.indexOf(socket.id);

      if (socketPoolIndex !== -1) {
        dethread.socketPool.remove(dethread.socketPoolIndex);
      } else {
        failedTaskIndeces.forEach((task) => dethread.failedTasks.push(task));
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
  for (let event in eventContainer) {
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
  state: undefined,
  closeProcess() {
    io.emit('processComplete');
    this.start();
  },

  on(event, callback) {
    eventContainer[event] = callback;
  },

  start(socketio, tasks, clientInit) {
    this.connections = new Connections();
    this.socketPool = new SocketPool();
    this.failedTasks = new FailedTasks();
    this.taskQueue = new TaskQueue(tasks);
    this.taskCompletionIndex = 0;
    this.state = {};
    io = socketio;
    localClientInit = clientInit;
    localTasks = tasks;
    handleSocket(clientInit);
  },
};


module.exports = dethread;
