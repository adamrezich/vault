var extend = require('node.extend');

var Room = require('./room.js').Room;
var Item = require('./item.js').Item;
var Player = require('./player.js').Player;
var Time = require('./time.js').Time;

function Command(verb, callback) {
	this.verb = verb;
	this.callback = callback;
}

Command.parse = function(player, command, callback) {
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
	for (var i = 0; i < Command.list.length; i++) {
		var cmds = [];
		if (Array.isArray(Command.list[i].verb)) cmds = Command.list[i].verb;
		else cmds.push(Command.list[i].verb);
		for (var j = 0; j < cmds.length; j++) {
			if (cmd == cmds[j].toLowerCase()) {
				found = true;
				var cmdfeedback = Command.list[i].callback(params, player);
				feedback = extend(feedback, cmdfeedback);
				break;
			}
		}
	}
	if (!found) feedback.messages.push('Command not understood. Type HELP for a list of commands.');
	
	if (feedback.messages.length == 0) delete feedback.messages;
	player.time.minute++;
	feedback = player.time.get_time(feedback);
	if (feedback.save) {
	}
	callback(feedback);
}


Command.list = [];
Command.list.push(new Command(['get', 'g', 'take', 'grab'], function(params, player) {
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
Command.list.push(new Command(['look', 'l'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = Room.list[player.room].describe(player, feedback);
	
	return feedback;
}));
Command.list.push(new Command(['north', 'n'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('n', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['south', 's'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('s', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['east', 'e'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('e', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['west', 'w'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('w', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['up', 'u'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('u', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['down', 'd'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback = player.move('d', feedback);
	
	return feedback;
}));
Command.list.push(new Command(['help', 'h'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback.messages.push('Sorry, there isn\'t a HELP list yet.');
	
	return feedback;
}));
Command.list.push(new Command(['go', 'head', 'walk'], function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	var dir = params;
	if (['n', 'north', 's', 'south', 'e', 'east', 'w', 'west', 'u', 'up', 'd', 'down'].indexOf(dir) == -1) {
		feedback.messages.push('Unrecognized direction.');
		return feedback;
	}
	dir = dir.charAt(0);
	
	feedback = player.move(dir, feedback);
	
	return feedback;
}));
Command.list.push(new Command('save', function(params, player) {
	var feedback = {};
	feedback.messages = [];
	
	feedback.messages.push('Saving...');
	
	//save_player(player, function(err) {
	player.save(function(err) {
		if (err) {
			//feedback.messages.push('Something went super wrong in the wrong-zone.');
		}
		else {
			//feedback.messages.push('Your game was saved successfully.');
		}
	});
	
	return feedback;
}));

exports.Command = Command;