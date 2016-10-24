
function dethread(io) {

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

  // emit to client to end versus looping through connection and closing
  Connections.prototype.terminateAll = function () {
    this.sockets = {};
    // emitting terminate for clients to close their own connection
    io.emit('terminate');
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

  function failedTask() {
    this.failedTaskQueue = [];
    this.length = 0;
  }

  failedTask.prototype.push = function (index) {
    this.failedTaskQueue.push(index);
    this.length++;
  };

  failedTask.prototype.pop = function (index) {
    this.length--;
    return this.failedTaskQueue.pop();
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
    return this.taskQueue[this.index--];
  };

}


module.exports = dethread;
