var Item = require('./item.js').Item;
var Area = require('./area.js').Area;
var Time = require('./time.js').Time;

function Room(internalName, name, area, description, nav, items) {
	this.internalName = internalName;
	this.name = name;
	this.area = area;
	this.description = description;
	this.nav = nav;
	this.items = items;
}

Room.list = {};

Room.push = function(room) {
	Room.list[room.internalName] = room;
}

Room.prototype.describe = function(player, feedback) {
	feedback.messages.push('_' + this.name);
	feedback.messages.push(this.description);
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
			feedback.messages.push(itemstr.replace(/\s+$/,''));
		}
	}
	feedback.place = this.get_place(player);
	return feedback;
}

Room.prototype.get_place = function(player) {
	var place = {};
	if (Room.list[player.room].area) place.small = Room.list[player.room].getArea().name;
	place.big = Room.list[player.room].name;
	return place;
}

Room.prototype.getArea = function() {
	return Area.list[this.area];
}

Room.push(new Room(
	'start',
	'Test Room One',
	'testzone',
	'The room is oddly empty, almost as though it is a debug room created solely for the purpose of testing a game engine or something. There is a doorway to the north.',
	{
		n: 'test2'
	},
	[
		new Item('flask', "Y'know, just a flask or whatever. Shut up.")
	]
));
Room.push(new Room(
	'test2',
	'Test Room Two',
	null,
	'Like the room to the south, this room is indescribably devoid of content. There is a doorway to the south.',
	{
		s: 'start'
	}
));

exports.Room = Room;