////
// State - game State machine
////

function State() { }

State.list = [];

State.current = function() {
	if (this.list.length > 0) {
		return this.list[this.list.length - 1];
	}
	else {
		return null;
	}
}

State.add = function(s, options) {
	Key.clear();
	State.list.push(s);
	State.current().draw();
}

State.replace = function(s, options) {
	State.list.pop();
	State.add(s, options);
}

State.reset = function() {
	State.list = [];
}

State.pop = function(options) {
	Key.clear();
	State.list.pop();
	if (options) {
		if (options.noredraw) return;
	}
	State.current().draw();
}

State.prototype.keys = { }

State.prototype.draw = function() { }

State.prototype.update = function() { }

State.prototype.first_draw = function() { }

State.prototype.handle_input = function() {
	for (var k in this.keys) {
		console.log(this.keys[k]);
	}
}



function State_signIn() {
	this.backspace_enabled = true;
	this.arrows_enabled = true;
	this.space_enabled = true;
	this.tab_enabled = true;
}

State_signIn.prototype = new State();



function State_main() {
}

State_main.prototype = new State();

State_main.prototype.update = function() {
	if (Key.isPressed(Key.code.enter) && Game.inputReady) State.add(new State_input(Key.isDown(Key.code.shift)));
}


function State_input(locked) {
	this.locked = locked;
	this.buffer = "";
	$('#inputcontainer').addClass('active');
}

State_input.prototype = new State();

State_input.prototype.update = function() {
	for (var i = 0; i < Key.typables.length; i++) {
		var str = String.fromCharCode(Key.typables[i]).toLowerCase();
		if (Key.isDown(Key.code.shift)) str = str.toUpperCase();
		if (Key.isPressed(Key.typables[i])) {
			this.type_char(str);
		}
	}
	if (Key.isPressed(Key.code.backspace)) this.delete_char();
	if (Key.isPressed(Key.code.enter)) this.confirm();
}

State_input.prototype.type_char = function(chr) {
	this.buffer += chr;
	var character = $('<span>').addClass('typedchar').html(chr);
	character.appendTo('#input-text').hide().show('fast');
}

State_input.prototype.confirm = function() {
	Game.inputReady = false;
	$('#input-text>span').animate({ opacity: 0 }, 200, function() { $(this).remove(); });
	setTimeout(function() {
		//$('#input-text').html('');
		Game.inputReady = true;
	}, 200);
	if (this.buffer != "") {
		now.sendCommand(this.buffer);
		var cmd= $('<div>').addClass('command').html('> ' + this.buffer);
		cmd.appendTo('#log');
		scroll_to_bottom_of_log();
		this.buffer = '';
	}
	else {
		$('#inputcontainer').removeClass();
		State.pop();
	}
}

State_input.prototype.delete_char = function() {
	if (this.buffer == '') return;
	this.buffer = this.buffer.substring(0, this.buffer.length - 1);
	$($('#input-text>span.typedchar')[this.buffer.length]).removeClass('typedchar').hide('fast', function() {
		$(this).remove();
	});
}