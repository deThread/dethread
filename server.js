const express = require('express');
const path = require('path');
const App = express(); 

App.use(express.static(path.join(__dirname, '/')));



App.listen(8080, function(e){
  console.log("connected on 8080");
});