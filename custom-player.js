const figure = document.querySelector("figure");
const media = document.querySelector("video");
const controls = document.querySelector(".controls");

const play = document.querySelector(".play");
const stop = document.querySelector(".stop");
const rwd = document.querySelector(".rwd");
const fwd = document.querySelector(".fwd");

const timerWrapper = document.querySelector(".timer");
const timer = document.querySelector(".timer span");
const timerBar = document.querySelector(".timer div");

const audio = document.querySelector(".audio");
const volumeUp = document.querySelector("#volume-up");
const volumeDown = document.querySelector("#volume-down");
const fullScreen = document.querySelector(".full-screen");
const speed = document.querySelector(".speed");

const dupeMedia = document.querySelector("#dupe-video");

console.log(media.textTracks);
//Gets rid of the default control buttons from the video window, but still allows us to utilize functions.
media.removeAttribute("controls");

//Sets a starting value for the timer display. The end time will most likely begin as 00:00:00 because the video has not loaded yet.
timer.innerHTML = `00:00:00 / ${getTimeValues(media.duration)}`;

//Prevents the control bar from always being on screen when mouse is hovering. It should go away after 4 seconds.
//Second event listener makes it so that controls will always display when mouse is active over them.
media.addEventListener("mousemove", displayControls);
controls.addEventListener("mousemove", () => {
  controls.style.opacity = 1;
});

function displayControls(event) {
  controls.style.opacity = 1;
  setTimeout(function() {
    controls.style.opacity = 0;
  }, 4000);
}

//PLAY/PAUSE FUNCTIONALITY
play.addEventListener("click", playPauseMedia);
media.addEventListener("click", playPauseMedia);

document.addEventListener("keydown", e => {
  const keyName = e.code;
  if (keyName === "Space") {
    e.preventDefault();
    playPauseMedia();
  }
});

function playPauseMedia() {
  //The first four lines below are to monitor whether the player is currently skipping forward/reverse, and if so, clears out that info.
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  if (media.src === undefined) {
    media.src = "https://archive.org/download/Detour_movie/Detour_512kb.mp4";
    media.load();
  }
  if (media.paused) {
    play.firstElementChild.classList.remove("fa-play");
    play.firstElementChild.classList.add("fa-pause");
    media.play();
  } else {
    play.firstElementChild.classList.remove("fa-pause");
    play.firstElementChild.classList.add("fa-play");
    media.pause();
  }
}

//STOP FUNCTIONALITY
stop.addEventListener("click", stopMedia);
media.addEventListener("ended", stopMedia);

function stopMedia() {
  //The first four lines below are to monitor whether the player is currently skipping forward/reverse, and if so, clears out that info.
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  media.removeAttribute("src");
  media.load();
  play.firstElementChild.classList.remove("fa-pause");
  play.firstElementChild.classList.add("fa-play");
}

//SKIP FORWARD/BACKWARDS FUNCTIONALITY
rwd.addEventListener("click", mediaBackward);
fwd.addEventListener("click", mediaForward);

let intervalFwd;
let intervalRwd;

function mediaBackward() {
  clearInterval(intervalFwd);
  fwd.classList.remove("active");

  if (rwd.classList.contains("active")) {
    rwd.classList.remove("active");
    clearInterval(intervalRwd);
    media.play();
  } else {
    rwd.classList.add("active");
    media.pause();
    intervalRwd = setInterval(windBackward, 200);
  }
}

function mediaForward() {
  clearInterval(intervalRwd);
  rwd.classList.remove("active");

  if (fwd.classList.contains("active")) {
    fwd.classList.remove("active");
    clearInterval(intervalFwd);
    media.play();
  } else {
    fwd.classList.add("active");
    media.pause();
    intervalFwd = setInterval(windForward, 200);
  }
}

function windBackward() {
  if (media.currentTime <= 3) {
    rwd.classList.remove("active");
    clearInterval(intervalRwd);
    stopMedia();
  } else {
    media.currentTime -= 3;
  }
}

function windForward() {
  if (media.currentTime >= media.duration - 3) {
    fwd.classList.remove("active");
    clearInterval(intervalFwd);
    stopMedia();
  } else {
    media.currentTime += 3;
  }
}

//UPDATING TIMECODE
media.addEventListener("timeupdate", setTimecode);

//This function will return a string based off of the time in seconds passed in.
function getTimeValues(time) {
  if (!time) {
    time = 0;
  }
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60 - hours * 60);
  let seconds = Math.floor(time - hours * 3600 - minutes * 60);
  let hourValue;
  let minuteValue;
  let secondValue;

  if (hours < 10) {
    hourValue = `0${hours}`;
  } else {
    hourValue = hours;
  }

  if (minutes < 10) {
    minuteValue = `0${minutes}`;
  } else {
    minuteValue = minutes;
  }

  if (seconds < 10) {
    secondValue = `0${seconds}`;
  } else {
    secondValue = seconds;
  }

  return `${hourValue}:${minuteValue}:${secondValue}`;
}

//This function resets the current timecode of the player, as well as reconfiguring the display of the progress bar.
function setTimecode() {
  timer.textContent = `${getTimeValues(media.currentTime)} / ${getTimeValues(
    media.duration
  )}`;

  let barLength =
    timerWrapper.clientWidth * (media.currentTime / media.duration);
  timerBar.style.width = `${barLength}px`;
}

//JUMP TO SPOT IN TIMELINE / CREATE THUMBNAILS FROM TIMELINE
let timerWrapperRect = timerWrapper.getBoundingClientRect();

timerWrapper.addEventListener("click", changePosition);
timerWrapper.addEventListener("mousemove", renderThumbnail);
timerWrapper.addEventListener("mouseout", () => {
  dupeMedia.style.opacity = 0;
});

function changePosition(e) {
  media.currentTime = calculateTime(e);
}

function renderThumbnail(e) {
  //When first loading the page, the video will most likely not have been loaded yet. This is why there is a fallback value of 0 for the timecode.
  let timeCode = calculateTime(e) || 0;
  dupeMedia.style.opacity = 1;
  timerWrapperRect = timerWrapper.getBoundingClientRect();
  let timerBarRect = timerBar.getBoundingClientRect();
  dupeMedia.style.left = `${e.x - timerBarRect.x - dupeMedia.width}px`;
  dupeMedia.currentTime = timeCode;
}

const calculateTime = e => {
  timerWrapperRect = timerWrapper.getBoundingClientRect();
  let begCoor = timerWrapperRect.x;
  let timerWidth = timerWrapperRect.width;
  let eventCoor = e.x;
  return media.duration * ((eventCoor - begCoor) / timerWidth);
};

//AUDIO FUNCTIONALITY
audio.addEventListener("click", toggleMute);
volumeUp.addEventListener("click", volumeChange);
volumeDown.addEventListener("click", volumeChange);

function toggleMute() {
  if (media.muted) {
    media.muted = false;
    audio.firstElementChild.classList.remove("fa-volume-mute");
    if (media.volume >= 0.5) {
      audio.firstElementChild.classList.add("fa-volume-up");
    } else {
      audio.firstElementChild.classList.add("fa-volume-down");
    }
  } else {
    media.muted = true;
    audio.firstElementChild.classList.remove(
      "fa-volume-up" || "fa-volume-down"
    );
    audio.firstElementChild.classList.add("fa-volume-mute");
  }
}

function volumeChange(e) {
  if (media.muted) {
    media.muted = false;
    audio.firstElementChild.classList.remove("fa-volume-mute");
  }
  if (e.target.id === "volume-up") {
    media.volume += 0.1;
  } else {
    media.volume -= 0.1;
  }
  if (media.volume >= 0.5) {
    audio.firstElementChild.classList.remove("fa-volume-down");
    audio.firstElementChild.classList.add("fa-volume-up");
  } else {
    audio.firstElementChild.classList.remove("fa-volume-up");
    audio.firstElementChild.classList.add("fa-volume-down");
  }
}

//FULLSCREEN FUNCTIONALITY
fullScreen.addEventListener("click", toggleFullscreen);

document.addEventListener("fullscreenchange", e => {
  if (media.classList.contains("fullscreen")) {
    media.classList.remove("fullscreen");
    fullScreen.firstElementChild.classList.remove("fa-compress");
    fullScreen.firstElementChild.classList.add("fa-expand");
  } else {
    media.classList.add("fullscreen");
    fullScreen.firstElementChild.classList.remove("fa-expand");
    fullScreen.firstElementChild.classList.add("fa-compress");
    document.addEventListener("mousemove", () => {
      setTimeout(() => {
        if (!media.classList.contains("cursor")) {
          media.classList.add("cursor");
        }
      }, 4000);
      media.classList.remove("cursor");
    });
  }
});

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    figure.requestFullscreen();
  }
}

//SKIP AHEAD/BACK 10 SECONDS
document.addEventListener("keydown", e => {
  const keyName = e.key;
  if (media.play) {
    if (keyName === "ArrowLeft") {
      if (media.currentTime <= 10) {
        media.currentTime = 0;
      } else {
        media.currentTime -= 10;
      }
    } else if (keyName === "ArrowRight") {
      if (media.currentTime >= media.duration - 10) {
        media.stop();
      } else {
        media.currentTime += 10;
      }
    }
  }
});

//PLAYBACK RATE FUNCTIONALITY
speed.addEventListener("click", changeSpeed);

function changeSpeed() {
  if (media.playbackRate === 1) {
    media.playbackRate = 2;
    speed.innerHTML = "Speed<br>x1";
  } else {
    media.playbackRate = 1;
    speed.innerHTML = "Speed<br>x2";
  }
}

//Want to update audio and playbackRate to be sliders/selectors

//Implement subtitle track
