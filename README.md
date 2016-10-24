# DeThread
###What is DeThread? 
DeThread is an application library that allows a developer to do things.
Developers, researchers and tech enthusiasts may be limited in terms of the problems they can solve due to processing power limitations.  There are no avaiable open-source tools to enable multiple, cross-platofrm devices to share processing power across the browser to complete a task. DeThread is an application library for users to share a distributed computational network, so that one computer can complete a resource intensive problem that otherwise wouldn't be possible.

###Why Javascript?
Other lower level languages may seem more well suited to the task, Javascript, however, presents a unique advantage:  any device equipped with a browser may be able to donate processing power to solving a task.  No downloading required, simply access a link. 

###How to use DeThread?

Example: 
  We used MD5 hash decryption as an example to illustrate the power of distributed computing.  Not only does DeThread allow for users to distribute a problem across multiple bot-net nodes, it distributes the problem further on each connected device. 
The problem is chunked once before it is distributed, then it is chunked again on the client and distributed to Web Workers dependent upon the client's hardware.
