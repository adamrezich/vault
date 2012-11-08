var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
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

var server = require('http').createServer(function(request, response) {
	var pathRoot = './public';
	var filePath = pathRoot + request.url;
	if (request.url == '/') filePath = pathRoot + '/index.html';
	var contentType = 'text/html';
	switch (path.extname(filePath)) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.png':
			contentType = 'image/png';
			break;
	}
	fs.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
	//res.end(fs.readFileSync(__dirname + '/public/test_client.html'));
}).listen(8080);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

nowjs.on('connect', function() {
	activePlayers[this.user.clientId] = {player: new Player('_unnamed_' + crypto.createHash('sha1').update((new Date()).getTime().toString()).digest('hex')), signed_in: false};
	//everyone.now.distributeMessage(activePlayers[this.user.clientId], 'You feel as though someone else has appeared near you, but you can\'t see them, or anything for that matter.');
});

nowjs.on('disconnect', function() {
	//everyone.now.distributeMessage(activePlayers[this.user.clientId], 'You feel a sense of loss, as though someone nearby has left you.');
	for (var i in activePlayers) {
		if (i == this.user.clientId) {
			delete activePlayers[i];
			break;
		}
	}
});

everyone.now.distributeMessage = function(sender, message) {
	var feedback = { messages: [ message ] };
	if (activePlayers[this.user.clientId].player != sender) this.now.receiveFeedback(feedback);
};

everyone.now.sendCommand = function(command) {
	/*if (activePlayers[this.user.clientId].signed_in) everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name, message);
	else everyone.now.receiveMessage(activePlayers[this.user.clientId].player.name + "*", message);*/
	var feedback = parse_command(activePlayers[this.user.clientId].player, command);
	this.now.receiveFeedback(feedback);
};

everyone.now.signIn = function(username, password, callback) {
	var thisnow = this.now;
	var thisuser = this.user;
	username = sanitize(username).xss();
	password = sanitize(password).xss();
	if (username == '') {
		callback({ error: 'You didn\'t even enter a username.' });
		return;
	}
	if (password == '') {
		callback({ error: 'You didn\'t even enter a password.' });
		return;
	}
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
	
	if (username == '') {
		callback({ error: 'You didn\'t even enter a username.' });
		return;
	}
	if (password == '') {
		callback({ error: 'You didn\'t even enter a password.' });
		return;
	}
	
	var thisnow = this.now;
	var v = new Validator();
	v.check(username, "Username must be between 3 and 15 characters.").len(3, 15);
	v.check(username, "Username must only contain letters, numbers, hyphens, and underscores.").is(/^[A-Za-z0-9_-]+$/);
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

function Player(name) {
	this.name = name;
}

function parse_command(player, command) {
	var feedback = {};
	feedback.messages = [];
	if (command.substring(0, 4) == "say ") {
		feedback.messages.push("You shout into the empty void and hope that someone else somewhere can hear you.");
		everyone.now.distributeMessage(player, 'A distant voice shouts: "' + command.substring(4) + '"');
	}
	else feedback.messages.push("Unknown command. Because, y'know, there aren't any actual commands yet.");
	//feedback.messages.push("We're testing multiple messages!");
	if (feedback.messages.length == 0) delete feedback.messages;
	return feedback;
}