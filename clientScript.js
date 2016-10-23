/*
1) Set up Socket.io Connection Script 
2) Determine Max Cors 
3) Dsitribute Tasks Function
  A. Index(Permutations) 
  B. Chunking problem (total)
4) Send Tasks Out 
*/

/*
 socket.on('connect', function(){});
 socket.on('event', function(data){});
 socket.on('disconnect', function(){});
*/

/*
MD5 Decryption
Create new socket connection 
See how many workers you would like to create 
*/

//Creating Socket Connection 
function socketWorker() {
  this.socket = io();
  this.socketClientCount = 0;
  this.socketConnection = []; 
  this.workerArr = []; 
  this.workerFlag = undefined; 
  this.maxCors = 0; 
}

//Determining Max Cors 
socketWorker.prototype.determineCors = function () {
  this.maxCors = navigator.hardwareConcurrency;
  return this.maxCors;
}

/**
 * @param {string} fileInput, worker input file 
 */
//Automatically create workers based upon number of cors client has 
socketWorker.prototype.autoWorkers = function(fileInput) {
  //returns number of workers available based upon cors 
  if(!this.workerFlag) this.workerFlag = true; 
  let workerCount = this.determineCors() / 2; 
  for(let i = 0; i < workerCount; i++) {
    let `worker${i}` = new Worker(fileInput); 
    this.workerArr.push(`worker${i}`);
  }

}

/**
 * @param {string} fileInput, worker file path  
 * @param {number} numWorker, number of workers client would use
 */
 // Allow client to create workers to work on particular file 
socketWorker.prototype.createWorker = function(fileInput, numWorker) {
  if(!this.workerFlag) this.workerFlag = true; 
  let maxWorkerCount = this.determineCors() / 2; 
  



}

//Distributing Tasks
//
//
//
//
//
//