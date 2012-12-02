function Item(name, description, events) {
	this.name = name;
	this.description = description;
	this.events = events;
}

function SimpleItem(name, description, properties) {
	this.name = name;
	this.description = description;
	this.properties = properties;
}

exports.Item = Item;