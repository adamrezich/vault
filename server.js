var crypto = require('crypto');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/public/test_client.html');
var util = require('util');
var shasum = crypto.createHash('sha1');

fs.exists(__dirname + '/data', function(exists) {
	if (!exists) fs.mkdir(__dirname + '/data', function() {
		fs.exists(__dirname + '/data/players', function(exists) {
			if (!exists) fs.mkdir(__dirname + '/data/players', function() {
			});
		});
	});
});

var activePlayers = [];

var server = require('http').createServer(function(req, res) {
	res.end(html);
});
server.listen(8080);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

nowjs.on('connect', function() {
	activePlayers[this.user.clientId] = {player: new Player(), logged_in: false};
	activePlayers[this.user.clientId].player.name = 'unnamed' + activePlayers.length;
});

nowjs.on('disconnect', function() {
	for (var i in activePlayers) {
		if (i == this.user.clientId) {
			delete activePlayers[i];
			break;
		}
	}
});

everyone.now.distributeMessage = function(message) {
	if (activePlayers[this.user.clientId].logged_in) everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name, message);
	else everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name + "*", message);
};

everyone.now.signIn = function(username, password) {
	var thisnow = this.now;
	var thisuser = this.user;
	fs.exists(__dirname + '/data/players/' + username, function(exists) {
		if (exists) {
			fs.readFile(__dirname + '/data/players/' + username, function(err, data) {
				if (err) thisnow.debug(username + ' tried to log in but man something went weird idk');
				else {
					var p = JSON.parse(data);
					if (crypto.createHash('sha1').update(password).digest('hex') == p.password) {
						var found = false;
						for (var i in activePlayers) {
							if (activePlayers[i].player.name == p.name) {
								found = true;
							}
						}
						if (!found) {
							activePlayers[thisuser.clientId].player = p;
							activePlayers[thisuser.clientId].signed_in = true;
							thisnow.debug(username + ' logged in totes successfully');
						}
						else {
							thisnow.debug('looks like you\'re already logged in somewhere else, and we\'re not advanced enough yet to do anything about it. sorry!');
						}
					}
					else {
						thisnow.debug(username + ' tried to log in, but the password was wrong!');
					}
				}
			});
		}
		else thisnow.debug(username + ' isn\'t even a real Player (yet[?])!');
	});
}
everyone.now.signUp = function(username, password) {
	var thisnow = this.now;
	fs.exists(__dirname + '/data/players/' + username, function(exists) {
		if (exists) thisnow.debug(username + ' tried to register but the name was taken!');
		else {
			var p = new Player();
			p.name = username;
			p.password = crypto.createHash('sha1').update(password).digest('hex');
			fs.writeFile(__dirname + '/data/players/' + username, JSON.stringify(p), function(err) {
				if (err) thisnow.debug(username + ' tried to register but something didn\'t work');
				else thisnow.debug(username + ' registered successfully!');
			});
		}
	});
}

function Player () {
}