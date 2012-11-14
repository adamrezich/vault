var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var util = require('util');
var shasum = crypto.createHash('sha1');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var extend = require('node.extend');

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
			p.room = 'start';
			save_player(p, function(err) {
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
	this.room = 'test1';
	this.roomdata = {};
	for (var i = 0; i < Object.keys(rooms).length; i++) {
		this.roomdata[Object.keys(rooms)[i]] = {};
		this.roomdata[Object.keys(rooms)[i]].items = rooms[Object.keys(rooms)[i]].items;
	}
}

Player.load = function(name, callback) {
}

Player.save = function(callback) {
}

function parse_command(player, command) {
	var feedback = {};
	feedback.messages = [];
	/*if (command.substring(0, 4) == "say ") {
		feedback.messages.push("You shout into the empty void and hope that someone else somewhere can hear you.");
		everyone.now.distributeMessage(player, 'A distant voice shouts: "' + command.substring(4) + '"');
	}
	else if (command == 'roguelike' || command == 'onecolumn' || command == 'onecolumnbasic') {
		feedback.layout = command;
	}
	else feedback.messages.push("Unknown command. Because, y'know, there aren't any actual commands yet.");*/
	
	if (command == '') {
		feedback.messages.push('You somehow managed to submit an empty command! Congratulations, I guess, but you didn\'t break the game or anything.');
		return feedback;
	}
	
	var split = command.split(' ');
	var cmd = split.shift().toLowerCase(); // I find this hilarious
	var params = '';
	if (split.length > 0) params = split.join(' ').toLowerCase();
	
	var found = false;
	for (var i = 0; i < commands.length; i++) {
		var cmds = [];
		if (Array.isArray(commands[i].verb)) cmds = commands[i].verb;
		else cmds.push(commands[i].verb);
		for (var j = 0; j < cmds.length; j++) {
			if (cmd == cmds[j].toLowerCase()) {
				found = true;
				var cmdfeedback = commands[i].callback(params, player);
				if (cmdfeedback.messages) feedback.messages = feedback.messages.concat(cmdfeedback.messages);
				if (cmdfeedback.layout) feedback.layout = cmdfeedback.layout;
				break;
			}
		}
	}
	if (!found) feedback.messages.push('Command not understood. Type HELP for a list of commands.');
	
	if (feedback.messages.length == 0) delete feedback.messages;
	return feedback;
}

function Item(name) {
	this.name = name;
}

function Room(internalName, name, description, nav, items) {
	this.internalName = internalName;
	this.name = name;
	this.description = description;
	this.nav = nav;
	this.items = items;
}

Room.prototype.describe = function(player, messages) {
	messages.push('_' + this.name);
	messages.push(this.description);
	var items = [];
	if (player.roomdata[this.internalName].items) {
		for (var i = 0; i < player.roomdata[this.internalName].items.length; i++) {
			items.push(player.roomdata[this.internalName].items[i].name);
		}
		if (items.length > 0) {
			var itemstr = 'There is ';
			for (var i = 0; i < items.length; i++) {
				itemstr += 'a ' + items[i] + ', '
			}
			messages.push(itemstr.replace(/\s+$/,''));
		}
	}
	return messages;
}

var rooms = {};
rooms['start'] = new Room(
	'start',
	'Test Room One',
	'The room is oddly empty, almost as though it is a debug room created solely for the purpose of testing a game engine or something. There is a doorway to the north.',
	{
		n: 'test2'
	},
	[
		new Item('flask')
	]
);
rooms['test2'] = new Room(
	'test2',
	'Test Room Two',
	'Like the room to the south, this room is indescribably devoid of content. There is a doorway to the south.',
	{
		s: 'start'
	}
);

function move(player, direction, feedback) {
	if (rooms[player.room].nav[direction]) {
		player.room = rooms[player.room].nav[direction];
		feedback.messages = rooms[player.room].describe(player, feedback.messages)
	}
	else feedback.messages.push('That isn\'t a useful direction from here.');
	return feedback;
}

function save_player(player, callback) {
	fs.writeFile(__dirname + '/data/players/' + player.name, JSON.stringify(player), function(err) {
		if (err) {
			callback(true);
			return;
		}
		else {
			callback(false);
			return;
		}
	});
}

function Command(verb, callback) {
	this.verb = verb;
	this.callback = callback;
}

var commands = [];
commands.push(new Command(['get', 'g', 'take', 'grab'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	if (!params || params == '') {
		feedback.messages.push('What do you want to get?');
		return feedback;
	}
	
	if (!player.roomdata[player.room].items) {
		feedback.messages.push('You see no such object in the room.');
		return feedback;
	}
	
	var found = false;
	for (var i = 0; i < player.roomdata[player.room].items.length; i++) {
		if (player.roomdata[player.room].items[i].name == params) {
			feedback.messages.push('You take the ' + player.roomdata[player.room].items[i].name + '.');
			found = true;
			break;
		}
	}
	if (!found) feedback.messages.push('You see no such object in the room.');
	
	return feedback;
}));
commands.push(new Command(['look', 'l'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback.messages = rooms[player.room].describe(player, feedback.messages);
	
	return feedback;
}));
commands.push(new Command(['north', 'n'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 'n', feedback);
	
	return feedback;
}));
commands.push(new Command(['south', 's'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 's', feedback);
	
	return feedback;
}));
commands.push(new Command(['east', 'e'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 'e', feedback);
	
	return feedback;
}));
commands.push(new Command(['west', 'w'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 'w', feedback);
	
	return feedback;
}));
commands.push(new Command(['up', 'u'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 'u', feedback);
	
	return feedback;
}));
commands.push(new Command(['down', 'd'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = move(player, 'd', feedback);
	
	return feedback;
}));
commands.push(new Command(['help', 'h'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback.messages.push('Sorry, there isn\'t a HELP list yet.');
	
	return feedback;
}));
commands.push(new Command(['go', 'head', 'walk'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	var dir = params;
	if (['n', 'north', 's', 'south', 'e', 'east', 'w', 'west', 'u', 'up', 'd', 'down'].indexOf(dir) == -1) {
		feedback.messages.push('Unrecognized direction.');
		return feedback;
	}
	dir = dir.charAt(0);
	
	feedback = move(player, dir, feedback);
	
	return feedback;
}));
commands.push(new Command('save', function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback.messages.push('Saving...');
	
	save_player(player, function(err) {
		if (err) {
			//feedback.messages.push('Something went super wrong in the wrong-zone.');
		}
		else {
			//feedback.messages.push('Your game was saved successfully.');
		}
	});
	
	return feedback;
}));