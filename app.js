var telnet = require('./libs/telserv.js').init();

telnet.registerRooms(['general', 'database']);
telnet.listen(8899);


var pushGeneral = function() {
  telnet.push('general', 'received data, hello here I am!');
};

var pushDatabase = function() {
  telnet.push('database', 'SELECT * FROM `lorem_ipsum` WHERE `dolor` > `sit`');
};

var timeoutId = setTimeout(pushGeneral, 6000);
var timeoutId = setTimeout(pushDatabase, 8000);

