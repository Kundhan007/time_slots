

const timer = {
	pomodoro: 15,
	shortBreak: 10,
	longBreak: 5,
	longBreakInterval: 4,
};

const modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);

function handleMode(event) {
	const { mode } = event.target.dataset;
	if (!mode) return;
	switchMode(mode);
	stopTimer();
}

function switchMode(mode) {
	timer.mode = mode;
	timer.remainingTime = {
		total: timer[mode] * 60,
		minutes: timer[mode],
		seconds: 0,
	};

	document
		.querySelectorAll("button[data-mode]")
		.forEach((e) => e.classList.remove("active"));
	document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
	document.body.style.backgroundColor = `var(--${mode})`;
	document
		.getElementById("js-progress")
		.setAttribute("max", timer.remainingTime.total);
	

	updateClock();
}
function updateClock() {
	const { remainingTime } = timer;
	const minutes = `${remainingTime.minutes}`.padStart(2, "0");
	const seconds = `${remainingTime.seconds}`.padStart(2, "0");

	const min = document.getElementById("js-minutes");
	const sec = document.getElementById("js-seconds");
	min.textContent = minutes;
	sec.textContent = seconds;
	const progress = document.getElementById("js-progress");
	progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function startTimer() {
    acquireLock()
	let { total } = timer.remainingTime;
	const endTime = Date.parse(new Date()) + total * 1000;

	mainButton.dataset.action = "stop";
	mainButton.textContent = "stop";
	mainButton.classList.add("active");

	interval = setInterval(function () {
		timer.remainingTime = getRemainingTime(endTime);
		updateClock();

		total = timer.remainingTime.total;
		if (total <= 0) {
			releaseLock()
			document.querySelector(`[data-sound="${timer.mode}"]`).play();
			clearInterval(interval);
		}
	}, 1000);
}

function getRemainingTime(endTime) {
	const currentTime = Date.parse(new Date());
	const difference = endTime - currentTime;

	const total = Number.parseInt(difference / 1000, 10);
	const minutes = Number.parseInt((total / 60) % 60, 10);
	const seconds = Number.parseInt(total % 60, 10);

	return {
		total,
		minutes,
		seconds,
	};
}
const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById("js-btn");
mainButton.addEventListener("click", () => {
    buttonSound.play();
	const { action } = mainButton.dataset;
	if (action === "start") {
		startTimer();
	} else {
		stopTimer();
	}
});

document.addEventListener("DOMContentLoaded", () => {
	switchMode("pomodoro");
});

function stopTimer() {
	clearInterval(interval);
	releaseLock()

	mainButton.dataset.action = "start";
	mainButton.textContent = "start";
	mainButton.classList.remove("active");
}

document.addEventListener('DOMContentLoaded', () => {
    // Let's check if the browser supports notifications
    if ('Notification' in window) {
      // If notification permissions have neither been granted or denied
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // ask the user for permission
        Notification.requestPermission().then(function(permission) {
          // If permission is granted
          if (permission === 'granted') {
            // Create a new notification
            new Notification(
              'Awesome! You will be notified at the start of each session'
            );
          }
        });
      }
    }
  
    switchMode('pomodoro');
  });

  var _createClass = (function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}
	return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
})();



function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}
var nativeWakeLock = function nativeWakeLock() {
	return "wakeLock" in navigator;
};
  var NoSleep = (function () {
	function NoSleep() {
		var _this = this;

		_classCallCheck(this, NoSleep);

		this.enabled = false;
		if (nativeWakeLock()) {
			this._wakeLock = null;
			var handleVisibilityChange = function handleVisibilityChange() {
				if (
					_this._wakeLock !== null &&
					document.visibilityState === "visible"
				) {
					_this.enable();
				}
			};
			document.addEventListener(
				"visibilitychange",
				handleVisibilityChange
			);
			document.addEventListener(
				"fullscreenchange",
				handleVisibilityChange
			);
		} else if (oldIOS()) {
			this.noSleepTimer = null;
		} else {
			// Set up no sleep video element
			this.noSleepVideo = document.createElement("video");

			this.noSleepVideo.setAttribute("title", "No Sleep");
			this.noSleepVideo.setAttribute("playsinline", "");

			this._addSourceToVideo(this.noSleepVideo, "webm", webm);
			this._addSourceToVideo(this.noSleepVideo, "mp4", mp4);

			this.noSleepVideo.addEventListener("loadedmetadata", function () {
				if (_this.noSleepVideo.duration <= 1) {
					// webm source
					_this.noSleepVideo.setAttribute("loop", "");
				} else {
					// mp4 source
					_this.noSleepVideo.addEventListener(
						"timeupdate",
						function () {
							if (_this.noSleepVideo.currentTime > 0.5) {
								_this.noSleepVideo.currentTime = Math.random();
							}
						}
					);
				}
			});
		}
	}

	_createClass(NoSleep, [
		{
			key: "_addSourceToVideo",
			value: function _addSourceToVideo(element, type, dataURI) {
				var source = document.createElement("source");
				source.src = dataURI;
				source.type = "video/" + type;
				element.appendChild(source);
			},
		},
		{
			key: "enable",
			value: function enable() {
				var _this2 = this;

				if (nativeWakeLock()) {
					return navigator.wakeLock
						.request("screen")
						.then(function (wakeLock) {
							_this2._wakeLock = wakeLock;
							_this2.enabled = true;
							console.log("Wake Lock active.");
							_this2._wakeLock.addEventListener("release", function () {
								// ToDo: Potentially emit an event for the page to observe since
								// Wake Lock releases happen when page visibility changes.
								// (https://web.dev/wakelock/#wake-lock-lifecycle)
								console.log("Wake Lock released.");
							});
						})
						.catch(function (err) {
							_this2.enabled = false;
							console.error(err.name + ", " + err.message);
							throw err;
						});
				} else if (oldIOS()) {
					this.disable();
					console.warn(
						"\n        NoSleep enabled for older iOS devices. This can interrupt\n        active or long-running network requests from completing successfully.\n        See https://github.com/richtr/NoSleep.js/issues/15 for more details.\n      "
					);
					this.noSleepTimer = window.setInterval(function () {
						if (!document.hidden) {
							window.location.href = window.location.href.split("#")[0];
							window.setTimeout(window.stop, 0);
						}
					}, 15000);
					this.enabled = true;
					return Promise.resolve();
				} else {
					var playPromise = this.noSleepVideo.play();
					return playPromise
						.then(function (res) {
							_this2.enabled = true;
							return res;
						})
						.catch(function (err) {
							_this2.enabled = false;
							throw err;
						});
				}
			},
		},
		{
			key: "disable",
			value: function disable() {
				if (nativeWakeLock()) {
					if (this._wakeLock) {
						this._wakeLock.release();
					}
					this._wakeLock = null;
				} else if (oldIOS()) {
					if (this.noSleepTimer) {
						console.warn(
							"\n          NoSleep now disabled for older iOS devices.\n        "
						);
						window.clearInterval(this.noSleepTimer);
						this.noSleepTimer = null;
					}
				} else {
					this.noSleepVideo.pause();
				}
				this.enabled = false;
			},
		},
		{
			key: "isEnabled",
			get: function get() {
				return this.enabled;
			},
		},
	]);

	return NoSleep;
})();
var noSleep = new NoSleep();

async function acquireLock() {
noSleep.enable();
 console.log(" no sleep enabled");
}

function releaseLock() {
	noSleep.disable();
	console.log(" no sleep disabled");
}
