i18n_loaded = false;
i18n = {};
i18n.loading_i18n = 'Loading...';



activeOverlayMessage = null;

$(document).ready(function () {
	load_i18n();

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
	$('#titlebox.clickable').click(
		function () {
			$(this).removeClass('clickable');
			$('#title').removeClass('hover');
			$('#author').removeClass('hover');
			$(this).css({ top: '250px', height: '220px' });
			setTimeout(function () {
				$('#loginbox').fadeIn(500);
			}, 50);
		}
	);
	$('#login_signin').click(
		function () {
			$('#titlebox').css('opacity', 0);
			setTimeout(function () {
				$('#titlebox').remove();
				layout_1col();
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
	check_for_browser_suckage();
	window_resize();
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

document.onselectstart = function() { return false; };
if (window.sidebar) {
	document.onmousedown = function() { return false; };
	document.onclick = function() { return true; };
}

function window_resize() {
	resize_overlay();
	if ($(window).width() < 960 || $(window).height() < 720) { overlay(i18n.viewport_too_small); }
	else if (activeOverlayMessage == i18n.viewport_too_small) overlay_disable();
}
function resize_overlay() {
	$('#overlay').width($(window).width()).height($(window).height());
	$('#overlay-message').width($(window).width()).height($(window).height());
}

function check_for_browser_suckage() {
	if ($.browser.msie) overlay(i18n.using_IE, true);
}

function overlay(message, override) {
	if (activeOverlayMessage && !override) return;
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

function arrays_equal(a,b) {
	return !!a && !!b && !(a<b || b<a);
}

function load_i18n() {
	overlay(i18n.loading_i18n);
	$.getJSON('json/i18n/en-us.json', function (data) {
		alert('lol');
	});
}