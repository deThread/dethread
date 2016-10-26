var socket;
var btn = document.getElementsByClassName('hungryBTN')[0];
var input = document.getElementsByClassName('workerInput')[0];
let amountOfWorkers;
let workerPool = [];
let hash;
let length;

btn.addEventListener('click', () => {
  socket = io();
  amountOfWorkers = input.value;
  for (let i = 0; i < amountOfWorkers; i++) {
    let worker = new Worker('./worker.js');
    worker.working = false;
    worker.onmessage = function handleMessage(e) {
      worker.working = false;
      if (e.data.cmd === 'success') {
        socket.emit('processComplete', e.data.clearText);
        workerPool.forEach((worker) => worker.terminate());
        socket.disconnect();
      }
      if (e.data.cmd === 'fail') {
        socket.emit('finishTask');
      }
    };
    workerPool.push(worker);
  }

  console.log('onclick');
  socket.on('connect', () => console.log('socket connected', socket.id))
  socket.emit('clientReady', amountOfWorkers);

  socket.on('clientInit', (data) => {
    length = data.length;
    hash = data.hash;
  });

  socket.on('startTask', (data) => {
    console.log(data);
    for (let i = 0; i < workerPool.length; i++) {
      let worker = workerPool[i]
      if (!worker.working) {
        worker.working = true;
        worker.postMessage({ cmd: 'start', hash, begin: data.begin, end: data.end, length });
        break;
      }
    }
  });

  socket.on('processComplete', (data) => {
    console.log('success:', data);
    workerPool.forEach((worker) => worker.terminate());
    workerPool = [];
    socket.disconnect();
  });
})