////
// state - game state machine
////

function state() { }

state.list = [];

state.current = function () {
	if (this.list.length > 0) {
		return this.list[this.list.length - 1];
	}
	else {
		return null;
	}
}

state.add = function (s, options) {
	state.list.push(s);
	if (options) {
		if (options.clear) $rle.clear();
	}
	state.current().draw();
}

state.replace = function(s, options) {
	state.list.pop();
	state.add(s, options);
}

state.reset = function () {
	state.list = [];
}

state.pop = function (options) {
	state.list.pop();
	$rle.clear();
	if (options) {
		if (options.noredraw) return;
	}
	state.current().draw();
}

state.prototype.keys = { }

state.prototype.draw = function () { }

state.prototype.update = function () { }

state.prototype.first_draw = function () { }

function state_main() {
}

state_main.prototype = new state();

state_main.prototype.keys = {
	input: {
		keys: key.enter,
		action: function () { console.log('input mode engaged!'); }
	},
	input_lock: {
		keys: key.enter,
		shift: true,
		action: function () { console.log('input LOCKED!'); }
	}
}