# DeThread

DeThread is an application library that allows a developer to do utilize the power of distributed computing on the web browser. 

If you are a DeThread user and would like to provide feed back on how we can improve, please
[click here to leave some feedback](https://docs.google.com/forms/d/e/1FAIpQLSdRxi7h0A7A0YFU5Bmcj1nduDyMIPpE5H9zZzPCwHnAY7cgdQ/viewform)

We would love the opportunity to dethread your problems.


--- 
## Contents 
1) [Background on Distribued Computing](#background)
2) [Installing & Getting Started](#install)
3) [API Documentation](#docs)
4) [MD5 Decryption Example](#md5)

--- 

## <a name="background"></a> Background on Distributed Computing
Distributed computing is simply a network of devices that communicate to work in-parallel in order to accomplish a singular task. Other lower level languages may seem more well suited to solve resource intensive problems. However, in the browser, there is only one language that comes to mind over others. JavaScript **_is_** the language of the web, and for that reason, any device that is equipped with a browser may be able processing power to solving a task.  No downloading required, simply access a link. 


--- 

## <a name="install"></a> Installing and Getting Started

In your terminal go ahead and install dethrea via npm:
```javascript
npm install --S dethread
```` 

## <a name="docs"></a> Documentation 

---
## <a name="md5"></a> Examples and Use Cases 

Example: 
  We used MD5 hash decryption as an example to illustrate the power of distributed computing.  Not only does DeThread allow for users to distribute a problem across multiple bot-net nodes, it distributes the problem further on each connected device. 
The problem is chunked once before it is distributed, then it is chunked again on the client and distributed to Web Workers dependent upon the client's hardware.
