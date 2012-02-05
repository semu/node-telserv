var net = require('net');
var srv = {'server': null, 'rooms': [], sockets: [], 'queue': {}, 'commands': ['quit help'], 'quit': ['quit', 'exit']};
exports = module.exports = {};

/**
 * Strip string buffered 
 * @param buffer data
 * @return string
 **/
function strip(data) {
	return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

/**
 * Register list of rooms
 * @param array data
 **/
exports.registerRooms = function (data) {
  srv.rooms = data;
};

/**
 * Handle command from socket
 * @param int sID socket ID
 * @param string cmd command
 **/
srv.handleCommand = function(sID, cmd) {
  srv.push(sID, '\nUnknown command, available are: ' + srv.commands.join(', ') + '\n\n');
};

/**
 * Handle received data
 * @param object socket
 * @param buffer buf
 **/
srv.receivedData = function(socket, buf) {
  var data = strip(buf);

	if (srv.quit.indexOf(data) > -1) {
		return srv.sockets[socket.id].end('\nHave a nice day!\n'); }
	
  if (!srv.isWaiting(socket.id)) {
    return true || srv.handleCommand(socket.id, data); }
  
  if (srv.isWaitingFor(socket.id, 'chooseRoom')) {
    if (!srv.rooms[data]) {
      srv.push(socket.id, '\nUnknown room, please try again: ');
    } else {
      srv.push(socket.id, '\nJoining room ' + srv.rooms[data] + '…\n\n');
      srv.doneEvent(socket.id, 'chooseRoom');
    }
  };
};

/**
 * Remove event from queue
 * @param int sID socket ID
 * @param string event
 **/
srv.doneEvent = function(sID, event) {
  delete srv.queue[sID][srv.queue[sID].indexOf(event)];
}

/**
 * Socket closed
 * @param object socket
 **/
srv.closed = function(socket) {

};

/**
 * Push message to socket
 * @param int sID socket ID
 * @param string data
 **/
srv.push = function(sID, data) {
  srv.sockets[sID].write(data);
};

/**
 * Handle new connection
 * @param object socket
 **/
srv.newConnection = function(socket) {
	socket.id = id = srv.sockets.length;
	socket.on('data', function(data) {
		srv.receivedData(socket, data);
	}).on('end', function() {
		srv.closed(socket);
	});	
	
	if (!srv.queue[socket.id]) {
	  srv.queue[socket.id] = []; }
  srv.sockets.push(socket);

  srv.push(id, '\nWelcome!\n');
  if (srv.rooms.length > 0) {
    srv.push(id, '\nPlease choose a logging room for filtering events:\n');
    var len = srv.rooms.length*1;
    for (var i = 0; i < srv.rooms.length; i++) {
      srv.push(id, ' [' + i + '] ' + srv.rooms[i] + '\n');
    }
    
    srv.push(id, '\nWhich room you want to join? [0-'+(len-1)+'] ');
    srv.waitFor(id, 'chooseRoom');
  }
};

/**
 * Check if socket is waiting
 * @param int sID socket ID
 * @return bool
 **/
srv.isWaiting = function(sID) {
  if (srv.queue[sID][0]) {
    return true;
  }
  
  return false;
  return srv.queue[sID].length > 0;
}

/**
 * Check if socket is waiting for specific event
 * @param int sID socket ID
 * @param string event
 * @return bool
 **/
srv.isWaitingFor = function(sID, event) {
  return srv.queue[sID].indexOf(event) > -1;
};

/**
 * Tell socket to wait for event
 * @param int sID socket ID
 * @param string event
 **/
srv.waitFor = function(sID, event) {
  this.queue[sID].push(event);
};

/**
 * Initialize Logger
 * @return object logger
 **/
exports.init = function() {
  this.server = net.createServer();
  
  this.server.on('connection', function(socket) {
    srv.newConnection(socket);
  });

  return this;
};

/**
 * Tell logger to listen on given port
 * @param int port
 **/
exports.listen = function(port) {
  this.server.listen(port);
};