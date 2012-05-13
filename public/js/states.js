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
	clear();
	if (options) {
		if (options.noredraw) return;
	}
	state.current().draw();
}

state.prototype.keys = { }

state.prototype.draw = function () { }

state.prototype.update = function () { }

state.prototype.first_draw = function () { }



function state_signIn() {
	this.backspace_enabled = true;
	this.arrows_enabled = true;
	this.space_enabled = true;
	this.tab_enabled = true;
}

state_signIn.prototype = new state();



function state_main() {
}

state_main.prototype = new state();

state_main.prototype.keys = {
	input: {
		keys: key.enter,
		action: function () { state.add(new state_input()); }
	},
	input_lock: {
		keys: key.enter,
		shift: true,
		action: function () { state.add(new state_input(true)); }
	}
}



function state_input(locked) {
	this.locked = locked;
	this.buffer = "";
	$('#prompt').addClass('active');
}

state_input.prototype = new state();

state_input.prototype.keys = {
	a: {
		keys: key.a,
		shift_optional: true,
		action: function () { state.current().type_char('a'); }
	},
	b: {
		keys: key.b,
		shift_optional: true,
		action: function () { state.current().type_char('b'); }
	},
	c: {
		keys: key.c,
		shift_optional: true,
		action: function () { state.current().type_char('c'); }
	},
	d: {
		keys: key.d,
		shift_optional: true,
		action: function () { state.current().type_char('d'); }
	},
	e: {
		keys: key.e,
		shift_optional: true,
		action: function () { state.current().type_char('e'); }
	},
	f: {
		keys: key.f,
		shift_optional: true,
		action: function () { state.current().type_char('f'); }
	},
	g: {
		keys: key.g,
		shift_optional: true,
		action: function () { state.current().type_char('g'); }
	},
	h: {
		keys: key.h,
		shift_optional: true,
		action: function () { state.current().type_char('h'); }
	},
	i: {
		keys: key.i,
		shift_optional: true,
		action: function () { state.current().type_char('i'); }
	},
	j: {
		keys: key.j,
		shift_optional: true,
		action: function () { state.current().type_char('j'); }
	},
	k: {
		keys: key.k,
		shift_optional: true,
		action: function () { state.current().type_char('k'); }
	},
	l: {
		keys: key.l,
		shift_optional: true,
		action: function () { state.current().type_char('l'); }
	},
	m: {
		keys: key.m,
		shift_optional: true,
		action: function () { state.current().type_char('m'); }
	},
	n: {
		keys: key.n,
		shift_optional: true,
		action: function () { state.current().type_char('n'); }
	},
	o: {
		keys: key.o,
		shift_optional: true,
		action: function () { state.current().type_char('o'); }
	},
	p: {
		keys: key.p,
		shift_optional: true,
		action: function () { state.current().type_char('p'); }
	},
	q: {
		keys: key.q,
		shift_optional: true,
		action: function () { state.current().type_char('q'); }
	},
	r: {
		keys: key.r,
		shift_optional: true,
		action: function () { state.current().type_char('r'); }
	},
	s: {
		keys: key.s,
		shift_optional: true,
		action: function () { state.current().type_char('s'); }
	},
	t: {
		keys: key.t,
		shift_optional: true,
		action: function () { state.current().type_char('t'); }
	},
	u: {
		keys: key.u,
		shift_optional: true,
		action: function () { state.current().type_char('u'); }
	},
	v: {
		keys: key.v,
		shift_optional: true,
		action: function () { state.current().type_char('v'); }
	},
	w: {
		keys: key.w,
		shift_optional: true,
		action: function () { state.current().type_char('w'); }
	},
	x: {
		keys: key.x,
		shift_optional: true,
		action: function () { state.current().type_char('x'); }
	},
	y: {
		keys: key.y,
		shift_optional: true,
		action: function () { state.current().type_char('y'); }
	},
	z: {
		keys: key.z,
		shift_optional: true,
		action: function () { state.current().type_char('z'); }
	},
	space: {
		keys: key.space,
		shift_optional: true,
		action: function () { state.current().type_char(' '); }
	},
	confirm: {
		keys: key.enter,
		action: function () { state.current().confirm(); }
	},
	backspace: {
		keys: key.backspace,
		action: function () { state.current().delete_char(); }
	},
}

state_input.prototype.type_char = function (chr) {
	this.buffer += chr;
	$('#input').html(this.buffer);
}

state_input.prototype.confirm = function () {
	$('#prompt').removeClass();
	state.pop();
}

state_input.prototype.delete_char = function () {
	if (this.buffer == '') return;
	this.buffer = this.buffer.substring(0, this.buffer.length - 1);
	$('#input').html(this.buffer);
}