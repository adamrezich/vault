var crypto = require('crypto');
var fs = require('fs');
var util = require('util');
var shasum = crypto.createHash('sha1');
var check = require('validator').check;
var sanitize = require('validator').sanitize;

var Validator = require('validator').Validator;
Validator.prototype.error = function(msg) {
	this._errors.push(msg);
	return this;
}
Validator.prototype.getErrors = function() {
	return this._errors;
}

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
	res.end(fs.readFileSync(__dirname + '/public/test_client.html'));
});
server.listen(8080);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

nowjs.on('connect', function() {
	activePlayers[this.user.clientId] = {player: new Player('_unnamed_' + crypto.createHash('sha1').update((new Date()).getTime().toString()).digest('hex')), signed_in: false};
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
	if (activePlayers[this.user.clientId].signed_in) everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name, message);
	else everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name + "*", message);
};

everyone.now.signIn = function(username, password, callback) {
	var thisnow = this.now;
	var thisuser = this.user;
	username = sanitize(username).xss();
	password = sanitize(password).xss();
	fs.exists(__dirname + '/data/players/' + username, function(exists) {
		if (exists) {
			fs.readFile(__dirname + '/data/players/' + username, function(err, data) {
				if (err) {
					callback({ error: username + ' Tried to log in but man something went weird idk' });
					return;
				}
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
							callback({
								success: true,
								notice: 'Signed in successfully!',
								data: {
									name: activePlayers[thisuser.clientId].player.name
								}
							});
							return;
						}
						else {
							callback({ error: 'Looks like you\'re already logged in somewhere else, and we\'re not advanced enough yet to do anything about it. Sorry!' });
							return;
						}
					}
					else {
						callback({ error: 'Incorrect password!' });
						return;
					}
				}
			});
		}
		else {
			callback({ error: '"' + username + '" is not a registered player!' });
		}
	});
}
everyone.now.signOut = function(callback) {
	activePlayers[this.user.clientId].signed_in = false;
	activePlayers[this.user.clientId].player = new Player('_unnamed_' + crypto.createHash('sha1').update((new Date()).getTime().toString()).digest('hex'));
	callback({ success: true });
}
everyone.now.signUp = function(username, password, confirm_password, callback) {
	username = sanitize(username).xss();
	password = sanitize(password).xss();
	confirm_password = sanitize(confirm_password).xss();
	
	var thisnow = this.now;
	var v = new Validator();
	v.check(username, "Username must be between 3 and 15 characters.").len(3, 15);
	v.check(username, "Username must only contain letters, numbers, hyphens, and underscores.").is(/^[a-z0-9_-]+$/);
	v.check(password, "Password must be between 6 and 32 characters.").len(6, 32);
	v.check(password, "Passwords do not match.").equals(confirm_password);
	
	var errors = v.getErrors();
	if (errors.length > 0) {
		callback({ error: errors });
		return;
	}
	
	fs.exists(__dirname + '/data/players/' + username, function(exists) {
		if (exists) {
			callback({ error: 'The name "' + username + '" has already been taken!' });
			return;
		}
		else {
			var p = new Player();
			p.name = username;
			p.password = crypto.createHash('sha1').update(password).digest('hex');
			fs.writeFile(__dirname + '/data/players/' + username, JSON.stringify(p), function(err) {
				if (err) {
					callback({ error: 'Something went super wrong in the wrong-zone' });
					return;
				}
				else {
					callback({ success: true, notice: 'Registered ' + username + ' successfully!' });
					return;
				}
			});
		}
	});
}

everyone.now.playerExists = function(username, callback) {
	fs.exists(__dirname + '/data/players/' + username, function(exists) {
		callback(exists);
	});
}

function Player (name) {
	this.name = name;
}