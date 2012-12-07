function Item(name, data) {
	this.name = name;
	this.data = data;
}

Item.Data = {
	"flask": {
		name: "flask",
		description: "Just a flask or whatever, shut up."
	}
};

exports.Item = Item;