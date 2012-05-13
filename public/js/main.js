i18n_loading = 'Loading...';
i18n_loaded = false;
i18n = {};

activeOverlayMessage = null;
browserSucks = false;
enforceViewportSize = false;

key = {
	_pressed: [],
	isDown: function (keyCode) {
		return ($.inArray(keyCode, this._pressed) != -1);
	},
	_down: function (event) {
		for (var key in this._pressed) {
			if (this._pressed[key] == event.keyCode) return false;
		}
		this._pressed.push(event.keyCode);
		if (!state.current()) return;
		for (var key in state.current().keys) {
			if (this.isDown(state.current().keys[key].keys) && ((state.current().keys[key].shift && this.isDown(this.shift)) || (!state.current().keys[key].shift && !this.isDown(this.shift)) || state.current().keys[key].shift_optional)) {
				state.current().keys[key].action();
				break;
			}
		}
		//return this._disabled(event.keyCode);
	},
	_up: function (event) {
		var pos = $.inArray(event.keyCode, this._pressed);
		if (pos != -1) this._pressed.splice(pos, 1);
		return this._disabled(event.keyCode);
	},
	_clear: function () {
		this._pressed.length = 0;
	},
	_shift: function () {
		return this.isDown(this.shift);
	},
	_disabled: function (keyCode) {
		switch (keyCode) {
			case key.backspace:
				if (state.current().backspace_enabled) return true;
				event.preventDefault();
				return false;
			case key.arrow_e[0]:
			case key.arrow_n[0]:
			case key.arrow_w[0]:
			case key.arrow_s[0]:
				if (state.current().arrows_enabled) return true;
				event.preventDefault();
				return false;
			case key.space:
				if (state.current().space_enabled) return true;
				event.preventDefault();
				return false;
			case key.tab:
				if (state.current().tab_enabled) return true;
				event.preventDefault();
				return false;
		}
		return true;
	},
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
}

function game() {
}

game.start = function () {
	state.replace(new state_main());
	$('#titlebox').remove();
	layout_1col();
}

$(document).ready(function () {
	resize_overlay();
	load_i18n();

	window.addEventListener('keyup', function(event) { key._up(event); }, false);
	window.addEventListener('keydown', function(event) { key._down(event); }, false);

	$(document).keydown(function (event) { return key._disabled(event.keyCode); })

	//game.start();

	$('#titlebox').hover(
		function () {
			if ($(this).hasClass('clickable')) {
				$('#title').addClass('hover');
				$('#author').addClass('hover');
			}
		},
		function () {
			if ($(this).hasClass('clickable')) {
				$('#title').removeClass('hover');
				$('#author').removeClass('hover');
			}
		}
	);
	$('body').on('click', '#titlebox', login_click);
	function login_click() {
		$(this).removeClass('clickable');
		$('body').off('click', '#titlebox', login_click);
		$('#title').removeClass('hover');
		$('#author').removeClass('hover');
		$(this).css({ top: '250px', height: '220px' });
		setTimeout(function () {
			$('#loginbox').fadeIn(500);
			setTimeout(function () {
				$('#login_username').focus();
			}, 500);
		}, 50);
	}
	$('#login_signin').click(
		function () {
			$('#titlebox').css('opacity', 0);
			setTimeout(function () {
				game.start();
			}, 500);
		}
	);
	$('#login_register').click(
		function () {
			alert('There isn\'t actually any sign in or registration yet!\nJust click "sign in" to continue!');
		}
	);
});

function initialize() {
	browserSucks = check_for_browser_suckage();
	window_resize();
	state.reset();
	state.add(new state_signIn());
	$(window).resize(function () {
		window_resize();
	});
}

function layout_1col() {
	$('#container').addClass('onecolumnbasic');
	$('#debug').css('opacity', 1);
}

function layout(mode) {
	$('#container').removeClass();
	$('#container').addClass(mode);
}

document.onselectstart = function () { return false; };
if (window.sidebar) {
	document.onmousedown = function () { return false; };
	document.onclick = function () { return true; };
}

function window_resize() {
	resize_overlay();
	if (browserSucks) return;
	if (!enforceViewportSize) return;
	if ($(window).width() < 960 || $(window).height() < 720) {
		overlay(i18n.viewport_too_small);
		$('#container-outline').fadeIn();
	}
	else if (activeOverlayMessage == i18n.viewport_too_small) {
		overlay_disable();
		$('#container-outline').fadeOut();
	}
}

function resize_overlay() {
	$('#overlay').width($(window).width()).height($(window).height());
	$('#overlay-message').width($(window).width()).height($(window).height());
}

function check_for_browser_suckage() {
	if ($.browser.msie) {
		overlay(i18n.using_IE, true);
		return true;
	}
	return false;
}

function overlay(message, override) {
	if (override && $('#overlay').css('display') == 'block') {
		overlay_disable();
		setTimeout(function () { overlay(message); }, 1000);
		return;
	}
	if (activeOverlayMessage) return;
	activeOverlayMessage = message;
	if ($.isArray(message)) {
		var newMessage = '';
		for (var i = 0; i < message.length; i++) {
			newMessage += '<div><span>' + message[i] + '</div></span>';
		}
		$('#overlay-message').html(newMessage);
	}
	else $('#overlay-message').html('<div><span>' + message + '</div></span>');
	overlay_enable();
}

function overlay_enable() {
	$('#overlay').fadeIn();
}

function overlay_disable() {
	activeOverlayMessage = null;
	$('#overlay').fadeOut();
}

function arrays_equal(a, b) {
	return !!a && !!b && !(a < b || b < a);
}

function load_i18n() {
	overlay(i18n_loading);
	$.getJSON('json/i18n/en-us.json', function (data) {
		i18n = data;
		overlay_disable();
		initialize();
	});
}