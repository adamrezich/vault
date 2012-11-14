var Item = require('./item.js').Item;

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

Room.list = {};
Room.list['start'] = new Room(
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
Room.list['test2'] = new Room(
	'test2',
	'Test Room Two',
	'Like the room to the south, this room is indescribably devoid of content. There is a doorway to the south.',
	{
		s: 'start'
	}
);

exports.Room = Room;