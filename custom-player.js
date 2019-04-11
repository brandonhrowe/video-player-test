const figure = document.querySelector("figure");
const video = document.querySelector(".custom-video");
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

const dupeVideo = document.querySelector("#dupe-video");

//Sets a starting value for the timer display. The end time will most likely begin as 00:00:00 because the video has not loaded yet.
timer.innerHTML = `00:00:00 / ${getTimeValues(video.duration)}`;

//Prevents the control bar from always being on screen when mouse is hovering. It should go away after 4 seconds.
//Second event listener makes it so that controls will always display when mouse is active over them.
video.addEventListener("mousemove", displayControls);
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
play.addEventListener("click", playPauseVideo);
video.addEventListener("click", playPauseVideo);

document.addEventListener("keydown", e => {
  const keyName = e.code;
  if (keyName === "Space") {
    e.preventDefault();
    playPauseVideo();
  }
});

function playPauseVideo() {
  //The first four lines below are to monitor whether the player is currently skipping forward/reverse, and if so, clears out that info.
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  if (video.src === undefined) {
    video.src = "https://archive.org/download/Detour_movie/Detour_512kb.mp4";
    video.load();
  }
  if (video.paused) {
    play.firstElementChild.classList.remove("fa-play");
    play.firstElementChild.classList.add("fa-pause");
    video.play();
  } else {
    play.firstElementChild.classList.remove("fa-pause");
    play.firstElementChild.classList.add("fa-play");
    video.pause();
  }
}

//STOP FUNCTIONALITY
stop.addEventListener("click", stopVideo);
video.addEventListener("ended", stopVideo);

function stopVideo() {
  //The first four lines below are to monitor whether the player is currently skipping forward/reverse, and if so, clears out that info.
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  video.removeAttribute("src");
  video.load();
  play.firstElementChild.classList.remove("fa-pause");
  play.firstElementChild.classList.add("fa-play");
}

//SKIP FORWARD/BACKWARDS FUNCTIONALITY
rwd.addEventListener("click", videoBackward);
fwd.addEventListener("click", videoForward);

let intervalFwd;
let intervalRwd;

function videoBackward() {
  clearInterval(intervalFwd);
  fwd.classList.remove("active");

  if (rwd.classList.contains("active")) {
    rwd.classList.remove("active");
    clearInterval(intervalRwd);
    video.play();
  } else {
    rwd.classList.add("active");
    video.pause();
    intervalRwd = setInterval(windBackward, 200);
  }
}

function videoForward() {
  clearInterval(intervalRwd);
  rwd.classList.remove("active");

  if (fwd.classList.contains("active")) {
    fwd.classList.remove("active");
    clearInterval(intervalFwd);
    video.play();
  } else {
    fwd.classList.add("active");
    video.pause();
    intervalFwd = setInterval(windForward, 200);
  }
}

function windBackward() {
  if (video.currentTime <= 3) {
    rwd.classList.remove("active");
    clearInterval(intervalRwd);
    stopVideo();
  } else {
    video.currentTime -= 3;
  }
}

function windForward() {
  if (video.currentTime >= video.duration - 3) {
    fwd.classList.remove("active");
    clearInterval(intervalFwd);
    stopVideo();
  } else {
    video.currentTime += 3;
  }
}

//UPDATING TIMECODE
video.addEventListener("timeupdate", setTimecode);

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
  timer.textContent = `${getTimeValues(video.currentTime)} / ${getTimeValues(
    video.duration
  )}`;

  let barLength =
    timerWrapper.clientWidth * (video.currentTime / video.duration);
  timerBar.style.width = `${barLength}px`;
}

//JUMP TO SPOT IN TIMELINE / CREATE THUMBNAILS FROM TIMELINE
let timerWrapperRect = timerWrapper.getBoundingClientRect();

timerWrapper.addEventListener("click", changePosition);
timerWrapper.addEventListener("mousemove", renderThumbnail);
timerWrapper.addEventListener("mouseout", () => {
  dupeVideo.style.opacity = 0;
});

function changePosition(e) {
  video.currentTime = calculateTime(e);
}

function renderThumbnail(e) {
  //When first loading the page, the video will most likely not have been loaded yet. This is why there is a fallback value of 0 for the timecode.
  let timeCode = calculateTime(e) || 0;
  dupeVideo.style.opacity = 1;
  timerWrapperRect = timerWrapper.getBoundingClientRect();
  let timerBarRect = timerBar.getBoundingClientRect();
  dupeVideo.style.left = `${e.x - timerBarRect.x - dupeVideo.width}px`;
  dupeVideo.currentTime = timeCode;
}

const calculateTime = e => {
  timerWrapperRect = timerWrapper.getBoundingClientRect();
  let begCoor = timerWrapperRect.x;
  let timerWidth = timerWrapperRect.width;
  let eventCoor = e.x;
  return video.duration * ((eventCoor - begCoor) / timerWidth);
};

//AUDIO FUNCTIONALITY
audio.addEventListener("click", toggleMute);
volumeUp.addEventListener("click", volumeChange);
volumeDown.addEventListener("click", volumeChange);

function toggleMute() {
  if (video.muted) {
    video.muted = false;
    audio.firstElementChild.classList.remove("fa-volume-mute");
    if (video.volume === 1) {
      audio.firstElementChild.classList.add("fa-volume-up");
    } else {
      audio.firstElementChild.classList.add("fa-volume-down");
    }
  } else {
    video.muted = true;
    audio.firstElementChild.classList.remove(
      "fa-volume-up" || "fa-volume-down"
    );
    audio.firstElementChild.classList.add("fa-volume-mute");
  }
}

function volumeChange(e) {
  if (video.muted) {
    video.muted = false;
    audio.firstElementChild.classList.remove("fa-volume-mute");
  }
  if (e.target.id === "volume-up") {
    video.volume += 0.1;
  } else {
    video.volume -= 0.1;
  }
  if (video.volume === 1) {
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
  if (video.classList.contains("fullscreen")) {
    video.classList.remove("fullscreen");
    fullScreen.firstElementChild.classList.remove("fa-compress");
    fullScreen.firstElementChild.classList.add("fa-expand");
  } else {
    video.classList.add("fullscreen");
    fullScreen.firstElementChild.classList.remove("fa-expand");
    fullScreen.firstElementChild.classList.add("fa-compress");
    document.addEventListener("mousemove", () => {
      setTimeout(() => {
        if (!video.classList.contains("cursor")) {
          video.classList.add("cursor");
        }
      }, 4000);
      video.classList.remove("cursor");
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
  if (video.play) {
    if (keyName === "ArrowLeft") {
      if (video.currentTime <= 10) {
        video.currentTime = 0;
      } else {
        video.currentTime -= 10;
      }
    } else if (keyName === "ArrowRight") {
      if (video.currentTime >= video.duration - 10) {
        video.stop();
      } else {
        video.currentTime += 10;
      }
    }
  }
});

//PLAYBACK RATE FUNCTIONALITY
speed.addEventListener("click", changeSpeed);

function changeSpeed() {
  if (video.playbackRate === 1) {
    video.playbackRate = 2;
    speed.innerHTML = "Speed<br>x1";
  } else {
    video.playbackRate = 1;
    speed.innerHTML = "Speed<br>x2";
  }
}

