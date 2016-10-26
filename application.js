'use strict';
const dethread = require('./dethread');
const tasks = [];
const hash = 'baa3b434dcfdd35adbaa0fc96cda3ac4';
const length = 5;
const possibilities = Math.pow(26,5);
const chunkSize = 1000000;
for (let i = 0; i < 11; i++){
  tasks.push({'begin' : i * chunkSize, 'end' : i * chunkSize + chunkSize - 1});
}
tasks.push({'begin' : 11000000, 'end' : 11881376});

dethread.state = initState();
const clientInit = {hash , length};
function initState() {
  return {
    characterSet: undefined,
    calculating: false,
    hash: undefined,
    length: undefined,
    globalNumCombos: undefined,
    taskIndex: 0,
    workerFrag: undefined,
    redistributeQueue: [],
    startTime: undefined,
    clearText: undefined,
    duration: undefined,
    sockets: {},
    socketPool: [],
    activeSocketCount: 0, // Clients become 'active/ready' when they submit the # of workers to use
    activeWorkerCount: 0,
    master: undefined,
  };
}

function socketConnection(io) {
  dethread.start(io,tasks,clientInit);
  // dethread.on('connection', () => {
  //   socket.emit('clientInit', clientInit);
  // })
  // io.on('connection', (socket) => {

  //   // Initialize connection info
  //   console.log(socket.id, 'connected');
  //   socket.ready = false;
  //   state.sockets[socket.id] = socket;

  //   socket.emit('client-connected-response', { hasMaster: !!state.master, numConnections: state.activeSocketCount });

  //   // Add event handlers to socket
  //   socket.on('claim-master', () => {
  //     console.log(socket.id, 'claim master');
  //     socket.ready = true;
  //     state.activeSocketCount += 1; // Note that the activeWorkerCount will not include the master's web workers until 'start-decryption'
  //     state.master = socket;
  //     socket.emit('claim-master-response', { globalConnections: state.activeSocketCount });
  //     socket.broadcast.emit('master-claimed', { globalConnections: state.activeSocketCount });
      
  //     socket.on('disconnect', () => {
  //       console.log(socket.id, 'master disconnected');
  //       socket.broadcast.emit('master-disconnected');
  //       state = initState();
  //     })
  //   });

  //   socket.on('client-ready', (data) => {
  //     socket.ready = true;
  //     socket.workers = data.workers;
  //     state.activeSocketCount += 1;
  //     state.activeWorkerCount += data.workers;

  //     const response = { globalConnections: state.activeSocketCount, globalWorkers: state.activeWorkerCount };

  //     if (state.calculating) {
  //       distributeWork(socket);
  //       socket.broadcast.emit('new-client-ready', response);
  //     } else {
  //       io.emit('new-client-ready', response);
  //     }
  //   });

  //   socket.on('start-decryption', (data) => {
  //     console.log('start decryption', data);
  //     socket.workers = data.workers;
  //     state.activeWorkerCount += data.workers;
  //     startDecryption(data);
  //   });

  //   socket.on('request-more-work', () => {
  //     console.log(socket.id, 'requested more work')
  //     distributeWork(socket);
  //   });

  //   socket.on('password-cracked', (data) => {
  //     console.log('password-cracked', data);
  //     state.clearText = data.clearText;
  //     state.duration = data.duration;
  //     socket.broadcast.emit('password-found', data);
  //     socket.disconnect();
  //     initState();
  //   });

  //   socket.on('disconnect', () => {
  //     if (!state.calculating || socket.id === state.master.id) return;

  //     // Update state counts
  //     state.activeWorkerCount -= socket.workers;
  //     state.activeSocketCount -= 1;

  //     // Store the incompleted task load in the redistribution pool
  //     const task = { begin: socket.begin, end: socket.end };
  //     state.redistributeQueue.push(task);
  //     console.log(socket.id, 'disconnected. queue:', state.redistributeQueue);

  //     // Call any available sockets from the socketPool
  //     if (state.socketPool.length) distributeWork(state.socketPool.shift());

  //     socket.broadcast.emit('client-disconnect', { globalWorkers : state.activeWorkerCount, globalConnections : state.activeSocketCount });

  //     delete state.sockets[socket.id];
  //   });
  // });
}


// function startDecryption(data) {
//   state.calculating = true;
//   state.hash = data.hash;
//   state.length = data.length;
//   state.globalNumCombos = Math.pow(26, Number(data.length));
//   state.startTime = Date.now();

//   state.workerFrag = Math.floor(state.globalNumCombos / state.activeWorkerCount);

//   // 1 worker can process 3 million samples in ~30 sec; keep the worker load to ~30 sec
//   if (state.workerFrag > 3000000) {
//     state.workerFrag = 3000000;
//   }

//   initiateWork();
// }

// function initiateWork() {
//   Object.keys(state.sockets).forEach((socketID) => {
//     const socket = state.sockets[socketID];
//     if (!socket.ready) return;

//     distributeWork(socket);
//   });
// }

// function distributeWork(socket) {
//   const clientCombos = state.workerFrag * socket.workers;
//   var begin;
//   var end;

//   if (state.redistributeQueue.length === 0) {
//     begin = state.taskIndex * state.workerFrag;
//     end = (begin + clientCombos) - 1;
//   } else {
//     // If there are tasks in the redistribute queue, deploy from the queue
//     const task = state.redistributeQueue.pop();
//     begin = task.begin;
//     end = (begin + clientCombos) - 1;

//     // If the task in the redistribute queue contains work for more workers than the
//     // requesting socket, store the remaining work back in the queue
//     const remainder = ((task.end - task.begin) + 1) - clientCombos;

//     if (remainder > 0) {
//       const newTask = { begin: task.end - remainder, end: task.end };
//       state.redistributeQueue.push(newTask);
//     }
//   }

  // socket.begin = begin;
  // socket.end = end;

  // Distribute work until all tasks are completed.
  // If all tasks are complete, store the socket in the socket pool, in case a node disconnects
  // var data;
  // if (begin >= state.globalNumCombos) {
  //   data = {
  //     globalNumCombos: state.globalNumCombos,
  //     globalConnections: state.activeSocketCount,
  //     globalWorkers: state.activeWorkerCount,
  //     hash: state.hash,
  //   };

  //   socket.emit('no-available-tasks', data);
  //   state.socketPool.push(socket);
  // } else {
  //   if (end >= state.globalNumCombos) end = state.globalNumCombos - 1;

    // state.taskIndex += socket.workers;

    // data = {
    //   startTime: state.startTime,
    //   length: state.length,
    //   globalNumCombos: state.globalNumCombos,
    //   globalConnections: state.activeSocketCount,
    //   globalWorkers: state.activeWorkerCount,
    //   hash: state.hash,
    //   begin,
    //   end,
    // };

//     socket.emit('start-work', data);
//   }
 //}

module.exports = socketConnection;
