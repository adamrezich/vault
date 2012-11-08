var Game = {
	fps: 60,
	inputReady: true
}

Game._onEachFrame = (function() {
	var requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

	if (requestAnimationFrame) {
		return function(cb) {
			var _cb = function() { cb(); requestAnimationFrame(_cb); }
			_cb();
		};
	}
	else {
		return function(cb) {
			setInterval(cb, 1000 / Game.fps);
		}
	}
})();

Game.start = function() {
	//State.add(new State_input(false));
	State.add(new State_main());
	Game._onEachFrame(Game.run);
};

Game.run = (function() {
	var loops = 0, skipTicks = 1000 / Game.fps,
	maxFrameSkip = 10,
	nextGameTick = (new Date).getTime(),
	lastGameTick;

	return function() {
		loops = 0;

		while ((new Date).getTime() > nextGameTick) {
			Game.update();
			nextGameTick += skipTicks;
			loops++;
		}

		if (loops) Game.draw();
	}
})();

Game.draw = function() {
};

Game.update = function() {
	if (State.list.length > 0) State.current().update();
	Key.update();
};


$(document).ready(function() {
	Game.start();
});

$(window).bind('focus', function() {
});
$(window).bind('blur', function() {
	for (prop in Key._pressed) { if (Key._pressed.hasOwnProperty(prop)) { delete Key._pressed[prop]; } }
});