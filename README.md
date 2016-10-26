# DeThread

DeThread is an application library that enables distributed computing with JavaScript in the web browser. 

If you are a DeThread user and would like to provide feed back on how we can improve, please
[click here to leave some feedback](https://docs.google.com/forms/d/e/1FAIpQLSdRxi7h0A7A0YFU5Bmcj1nduDyMIPpE5H9zZzPCwHnAY7cgdQ/viewform).

We would love the opportunity to dethread your problems.


## Contents 
1. [Background on Distribued Computing](#background)
2. [Installation](#install)
3. [API Documentation](#docs)
4. [Getting Started](#gettingStarted)
5. [Task Handling on the Client](#clientSide)
6. [MD5 Decryption Example](#md5)
7. [Contributors](#contributors)


## <a name="background"></a> Background on Distributed Computing
Distributed computing is a processing model that utilizes a network of devices that work in-parallel in order to reduce the amount of time it takes to complete a task. Distributed computing has traditionally utilized low-level languages, which are often more performant.  However, JavaScript offers several unique advantages, as the language of the web. For that reason, any device equipped with a browser may contribute to a distributed process.  No downloading required, simply access a link. 


## <a name="install"></a> Installation

In the terminal, install dethread via npm:
```javascript
npm install --S dethread
``` 

## <a name="docs"></a> API Documentation 

###Methods 

```javascript
dethread.start(io, tasks, clientInit) 
  // Initializes dethread distributed computing process.
dethread.on(event name, callback)
  // Adds custom socket event handlers.
dethread.closeProcess()
  // Terminate socket connections and reset server state.
``` 

###Properties

```javascript
dethread.state
  // Object to contain application state.
dethread.connections
  // Array of current connected socket-clients
dethread.socketPool
  // Array of current, non-working socket-clients, referenced by ID.
dethread.taskQueue
  // Array of total set of all tasks.
dethread.taskCompletionIndex
  // Index that tracks sent tasks.
dethread.failedTasks
  // Array of current references to failed tasks, referenced by taskQueue index.
``` 
## <a name="gettingStarted"></a> Getting Started

The DeThread library is built on top of the socket.io library.  In your server, simply require the socket.io and dethread modules.
<br/>
<br/>
Getting started is easy, first call dethread.start. 
```javascript
const http = require('http')
const io = require('socket.io')(http)

const tasks = [...]
  // An array of the total set of all task chunks.
const clientInit = {...}
  // An options object to provide data to the clients on initial socket connection.

dethread.start(io, tasks, clientInit)
```
To create a custom socket event handler, use dethread.on.
To emit a response back to a client, you must use the socketID to retrieve the corresponding socket client.  To do this, simply reference the socket object using dethread.connections[socketID].  This will return a socket object to which you can emit.
```javascript

dethread.on('inEvent', function(socketID, ...Params){
  dethread.connections[socketID].emit('outEvent', data)
})
```
Task distribution with dethread is easy. After calling dethread.start, task distribution and failure handling are both
managed internally.  There is no need for a developer to reference dethread.connections, dethread.socketPool, dethread.taskQueue, dethread.taskCompletionIndex, or dethread.failedTasks for simple applications.  However, these properties are exposed and accessible to the developer for advanced processes.

## <a name="clientSide"></a> Task Handling on the Client
Communication between client and servers is handled with the socket.io interface. To handle and emit socket events,
use the [socket.io client API](http://socket.io/docs/).
Before the client can receive task from the server, the client must emit a clientReady message.

```javascript

socket.emit('clientReady')
```

To terminate and resolve a distributed computing process, specifify the following socket emit event: 
```javascript
socket.emit('processComplete', data)
```
### <a name="webWorkers"></a> Task Distribution with Web Workers
Web Workers are used to simulate a multithread environment to enable concurrent processing. The client may receive multiple tasks from the server to process. To specifiy the number of workers to use on a client pass in a number as a second parameter to clientReady message. Use navigator.hardwareConcurrency to determine the maximum number of Web Workers a client can handle(number of cores). 

```javascript

socket.emit('clientReady', numWorkers)
```
If numWorkers is not supplied, it defaults to 1.
## <a name="md5"></a> Examples and Use Cases 

[Example:](http://dethread.io/)
We used MD5 hash decryption as an example to illustrate the power of distributed computing.  Not only does DeThread allow for users to distribute a problem across multiple bot-net nodes, it distributes the problem further on each connected device. 
The problem is chunked once before it is distributed, then it is chunked again on the client and distributed to Web Workers dependent upon the client's hardware.

## <a name="contributors"></a> Contributors 
* [Bryan Yee](https://github.com/bryanyee)
* [Shawn Southwell](https://github.com/shawn-southwell)
* [Daniel Lao](https://github.com/Dlaosb)
