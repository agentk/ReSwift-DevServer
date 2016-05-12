var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(9000);

var fileRoutes = {
  '/': '/index.html',
  '/jquery.js': '/node_modules/jquery/dist/jquery.js',
};

function handler (req, res) {
  if (Object.keys(fileRoutes).indexOf(req.url) != -1) {
    fs.readFile(__dirname + fileRoutes[req.url], function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}

var actions = [];
var currentAction = 0;

io.on('connection', function (socket) {

  socket.on('clientId', function(deviceId) {
    socket.deviceId = deviceId;
    socket.emit('allActions', actions);
    socket.emit('setCurrentAction', currentAction);
    console.log("[CLIENT] Connected: " + socket.conn.id);
  });

  socket.on('deviceId', function(deviceId) {
    socket.deviceId = deviceId;
    console.log("[DEVICE] Connected deviceId: " + deviceId);
  });

  socket.on('deviceRefresh', function() {
    socket.emit('allActions', actions);
    socket.emit('setCurrentAction', currentAction);
  });

  socket.on('appendAction', function(data) {
    actions.push(data);
    currentAction = actions.length;
    socket.broadcast.emit('appendAction', data);
    socket.broadcast.emit('setCurrentAction', currentAction);
  });

  socket.on('setCurrentAction', function(data) {
    currentAction = data;
    socket.broadcast.emit('setCurrentAction', data);
  });

  socket.on('getAllActions', function() {
    socket.emit('allActions', actions);
  });

  socket.on('reset', function() {
    actions = [];
    currentAction = 0;
    socket.emit('reset');
  });

});
