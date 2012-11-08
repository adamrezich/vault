var Key = {
	_pressed: {},
	_pressedLast: {},
	
	code: {
		_0: 48,
		_1: 49,
		_2: 50,
		_3: 51,
		_4: 52,
		_5: 53,
		_6: 54,
		_7: 55,
		_8: 56,
		_9: 57,
		a: 65,
		b: 66,
		c: 67,
		d: 68,
		e: 69,
		f: 70,
		g: 71,
		h: 72,
		i: 73,
		j: 74,
		k: 75,
		l: 76,
		m: 77,
		n: 78,
		o: 79,
		p: 80,
		q: 81,
		r: 82,
		s: 83,
		t: 84,
		u: 85,
		v: 86,
		w: 87,
		x: 88,
		y: 89,
		z: 90,
		arrow_e: [39, 76, 102],
		arrow_ne: [85, 105],
		arrow_n: [38, 75, 104],
		arrow_nw: [89, 103],
		arrow_w: [37, 72, 100],
		arrow_sw: [66, 97],
		arrow_s: [40, 74, 98],
		arrow_se: [78, 99],
		escape: 27,
		backspace: 8,
		enter: 13,
		space: 32,
		page_up: 33,
		page_down: 34,
		shift: 16,
		forward_slash: 191,
		tab: 9
	},
	
	typables: [
		32,
		48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
		65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90
	],
	
	onKeyDown: function(event) {
		Key._pressed[event.keyCode] = (new Date()).getTime();
		//event.preventDefault();
		return false;
	},
	onKeyUp: function(event) {
		delete Key._pressed[event.keyCode];
		//event.preventDefault();
		return false;
	},
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	isPressed: function(keyCode) {
		return this._pressed[keyCode] != this._pressedLast[keyCode] && this._pressed[keyCode] != null;
	},
	
	update: function() {
		for (prop in Key._pressedLast) { if (Key._pressedLast.hasOwnProperty(prop)) { delete Key._pressedLast[prop]; } }
		for (prop in Key._pressed) Key._pressedLast[prop] = Key._pressed[prop];
	},
	
	clear: function() {
		for (prop in Key._pressed) { if (Key._pressed.hasOwnProperty(prop)) { delete Key._pressed[prop]; } }
		for (prop in Key._pressedLast) { if (Key._pressedLast.hasOwnProperty(prop)) { delete Key._pressedLast[prop]; } }
	}

}

$(document).ready(function() {
	$(document).keyup(function(e) {
		Key.onKeyUp(e)
	});
	$(document).keydown(function(e) {
		Key.onKeyDown(e);
		var element = e.target.nodeName.toLowerCase();
		if (element != 'input' && e.keyCode == 8) return false;
	});
});