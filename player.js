var extend = require('node.extend');
var fs = require('fs');

var Room = require('./room.js').Room;
var Item = require('./item.js').Item;

function Player(name) {
	this.name = name;
	this.room = 'test1';
	this.roomdata = {};
	for (var i = 0; i < Object.keys(Room.list).length; i++) {
		this.roomdata[Object.keys(Room.list)[i]] = {};
		this.roomdata[Object.keys(Room.list)[i]].items = Room.list[Object.keys(Room.list)[i]].items;
	}
}

Player.load = function(data) {
	var p = new Player();
	return extend(p, data);
}

Player.prototype.save = function(callback) {
	fs.writeFile(__dirname + '/data/players/' + this.name, JSON.stringify(this), function(err) {
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

Player.prototype.move = function(direction, feedback) {
	if (Room.list[this.room].nav[direction]) {
		this.room = Room.list[this.room].nav[direction];
		feedback.messages = Room.list[this.room].describe(this, feedback.messages)
	}
	else feedback.messages.push('That isn\'t a useful direction from here.');
	return feedback;
}

exports.Player = Player;