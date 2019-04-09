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

// const canvas = document.querySelector("#img-canvas");
const dupeMedia = document.querySelector("#dupe-video")

media.removeAttribute("controls");
controls.style.visibility = "visible";

//Prevents the control bar from always being on screen when mouse is hovering
media.addEventListener("mousemove", displayControls);

function displayControls(e) {
  controls.classList.add("controls-display");
  setTimeout(function() {
    controls.classList.remove("controls-display");
  }, 4000);
}

//Play/Pause functionality
play.addEventListener("click", playPauseMedia);

document.addEventListener("keydown", e => {
  e.preventDefault();
  const keyName = e.code;
  if (keyName === "Space") {
    playPauseMedia();
  }
});

function playPauseMedia() {
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  if (media.src === undefined) {
    media.src = "https://archive.org/download/Detour_movie/Detour_512kb.mp4";
    media.load();
    // media.play();
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

//Stop functionality
stop.addEventListener("click", stopMedia);
media.addEventListener("ended", stopMedia);

function stopMedia() {
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
  // media.pause();
  // media.currentTime = 0;
  media.removeAttribute("src");
  media.load();
  play.firstElementChild.classList.remove("fa-pause");
  play.firstElementChild.classList.add("fa-play");
}

//Skip forward/backward functionality
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

//Keeping the timecode up to date
media.addEventListener("timeupdate", setTime);

function setTime() {
  let hours = Math.floor(media.currentTime / 3600);
  let minutes = Math.floor((media.currentTime - hours) / 60);
  let seconds = Math.floor(media.currentTime - minutes * 60);
  let hourValue;
  let minuteValue;
  let secondValue;

  if (hours < 10) {
    hourValue = `0${hours}`;
  } else {
    hourValue = hours;
  }

  if (minutes < 10) {
    minuteValue = "0" + minutes;
  } else {
    minuteValue = minutes;
  }

  if (seconds < 10) {
    secondValue = "0" + seconds;
  } else {
    secondValue = seconds;
  }

  let mediaTime = hourValue + ":" + minuteValue + ":" + secondValue;
  timer.textContent = mediaTime;

  let barLength =
    timerWrapper.clientWidth * (media.currentTime / media.duration);
  timerBar.style.width = barLength + "px";
}

//Allowing user to click on time wrapper and change current time
let timerWrapperRect = timerWrapper.getBoundingClientRect();

timerWrapper.addEventListener("click", changePosition);
timerWrapper.addEventListener("mousemove", draw)
timerWrapper.addEventListener("mouseout", () => {
  dupeMedia.style.opacity = 0;
})

function changePosition(e) {
  let begCoor = timerWrapperRect.x;
  let timerWidth = timerWrapperRect.width;
  let clickCoor = e.x;
  media.currentTime = media.duration * ((clickCoor - begCoor) / timerWidth);
}

function draw(e) {
  let begCoor = timerWrapperRect.x;
  let timerWidth = timerWrapperRect.width;
  let hoverCoor = e.x;
  let timeCode = media.duration * ((hoverCoor - begCoor) / timerWidth);
  // let context = canvas.getContext("2d");
  dupeMedia.style.opacity = 1;
  dupeMedia.style.left = `${(hoverCoor - begCoor)}px`;
  console.log(dupeMedia.style.left)
  dupeMedia.pause()
  dupeMedia.currentTime = timeCode;
  // setTime(5000)
  // context.drawImage(media, 0, 0, canvas.width, canvas.height);
}

//Audio functionality
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

//Fullscreen functionality
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
  }
});

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    figure.requestFullscreen();
  }
}

//Skip ahead/back 10 seconds with arrow click
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

//Change playback speed functionality
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

// timerWrapper.addEventListener("hover", showThumbnail...);
//Need to utilize some library to take image at specific time and display it in popup window

//Want to update audio and playbackRate to be sliders/selectors

//Look more into implementing other info from Internet Archive API, such as title, etc.

//Implement subtitle track
