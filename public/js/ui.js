$(document).ready(function () {

	/*$('#titlebox').fadeOut(500);
	setTimeout(function () {
		$('#titlebox').remove();
		layout_1col();
		layout('onecolumn');
	}, 500);*/

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
			$(this).css({ top: '250px', height: '480px' });
			setTimeout(function () {
				$('#loginbox').fadeIn(500);
			}, 50);
		}
	);
});

function layout_1col() {
	$('#container').addClass('onecolumnbasic');
	$('#logcontainer').fadeIn();
	$('#inputcontainer').fadeIn();
	$('#debug').show();
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

function handle_errors(result) {
	if (Object.prototype.toString.call(result.error) === '[object Array]') {
		for (var e in result.error) flash(result.error[e]);
	}
	else if (result.error) flash(result.error);
	
	if (Object.prototype.toString.call(result.notice) === '[object Array]') {
		for (var n in result.notice) flash(result.notice[n]);
	}
	else if (result.notice) flash(result.notice);
}

function clear_flashes() {
	$('#flashes>.flash').remove();
}

function flash(message) {
	var close = $('<span>').addClass('close-button').html('X');
	close.click(function(e) {
		$(e.currentTarget).parent().hide().remove();
	});
	var f = $('<div>').addClass('flash').html(message);
	//close.appendTo(f);
	f.appendTo('#flashes');
}

function scroll_to_bottom_of_log() {
	//$("#log").scrollTop($("#log")[0].scrollHeight);
	$('#log').stop().animate({ scrollTop: $('#log')[0].scrollHeight }, 'slow');
}

$(document).ready(function() {

	now.receiveFeedback = function(feedback) {
		$('#log>div').addClass('read');
		if (feedback.messages) {
			for (var m in feedback.messages) {
				$("#log").append('<div>' + feedback.messages[m] + '</div>');
				scroll_to_bottom_of_log();
			}
		}
		if (feedback.layout) {
			layout(feedback.layout);
		}
	}
	
	now.debug = function(message) {
		flash(message);
	}

	$("#login_signin").click(function() {
		clear_flashes();
		this.blur();
		if ($('#login_username').val() == '' && $('#login_password').val() == '') {
			$('#login_username').val('debug');
			$('#login_password').val('password');
		}
		now.signIn($('#login_username').val(), $('#login_password').val(), function(result) {
			handle_errors(result);
			if (result.success) {
				$('#titlebox').fadeOut(500);
				setTimeout(function () {
					$('#titlebox').remove();
					layout_1col();
					setTimeout(function() {
						$('#log').width($('#log').width() + $('#log').width() - document.getElementById("log").scrollWidth + 5);
					}, 1000);
					$('#log').append('<div class="read">HINT: press Enter to open the prompt, type a command, and then press Enter again to send it.</div>');
					$('#log').append('<div class="read">HINT: this is going to be an interactive fiction text adventure thing, but right now, for no good reason, the only command that does anything is "say."</div>');
					$('#log').append('<div class="description">You stand in a dark, empty void, probably because isn\'t a world for this game to exist in yet. The obvious exits are... well, there aren\'t actually any obvious exits.</div>');
				}, 500);
				/*$('#user-area').html('signed in as ' + result.data.name);
				$('#signin-button').hide();
				$('#signup-button').hide();
				$('#signout-button').show();
				$('#login_username').hide();
				$('#login_password').hide();
				*/
			}
		});
	});
	
	/*$('#signout-button').click(function() {
		clear_flashes();
		flash('Signed out!');
		now.signOut(function(result) {
			handle_errors(result);
			if (result.success) {
				$('#user-area').html('not signed in');
				$('#signin-button').hide();
				$('#signup-button').hide();
				$('#signout-button').hide();
				$('#login_username').show();
				$('#login_password').show();
				$('#login_username').val('');
				$('#login_password').val('');
			}
		});
	});*/
	
	//$('#log').tinyscrollbar();
	//$('#logwrapper').height($('#log').height());

	// width of our wrapper equals width of the inner part of the textarea
	//document.getElementById("logcontainer").style.width = document.getElementById("log").scrollWidth + 'px';
	
	
	$("#login_register").click(function() {
		clear_flashes();
		now.signUp($('#login_username').val(), $('#login_password').val(), $('#login_confirm-password').val(), function(result) {
			handle_errors(result);
			if (result.success) {
				$('#login_register').hide();
				$('#login_confirm-password').hide();
				$('#login_confirm-password').val('');
				$('#login_signin').show();
			}
		});
	});
	
	
	$('#login_username').blur(function() {
		now.playerExists($('#login_username').val(), function(exists) {
			if (exists) {
				$('#login_confirm-password').hide();
				$('#login_signin').show();
			}
			else {
				$('#login_confirm-password').show();
				$('#login_signin').hide();
			}
		});
	});
	
});