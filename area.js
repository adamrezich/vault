function Area(internalName, name) {
	this.internalName = internalName;
	this.name = name;
}

Area.list = {};

Area.push = function(area) {
	Area.list[area.internalName] = area;
}

Area.push(new Area(
	'testzone',
	'The Testing Zone'
));

exports.Area = Area;