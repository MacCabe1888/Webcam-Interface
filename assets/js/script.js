const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const context = canvas.getContext("2d");
let bgImg = null;
const bgColor = document.getElementById("bgColor");
const toggleBtn = document.getElementById("toggleBG");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

let usingImg = false;
canvas.style.background = bgColor.value;

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(e => console.error(e));
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    context.drawImage(video, 0, 0, width, height);
    let pixels = context.getImageData(0, 0, width, height);
    pixels = effects(pixels);
    context.putImageData(pixels, 0, 0);
  }, 16);
}

function uploadBG() {
  const file = document.getElementById("bgFile").files[0];
  const reader = new FileReader();
  
  reader.onloadend = function() {
    usingImg = true;
    toggleBtn.innerText = "Use Background Color";
    bgImg = `url("${reader.result}")`;
    canvas.style.background = bgImg;
  }
  
  if (file) {
    reader.readAsDataURL(file);
  }
}

function updateBGC() {
  usingImg = false;
  toggleBtn.innerText = "Use Background Image";
  canvas.style.background = bgColor.value;
}

function toggleBG() {
  usingImg = !usingImg;
  toggleBtn.innerText = usingImg ? "Use Background Color" : "Use Background Image";
  canvas.style.background = usingImg ? bgImg : bgColor.value;
}

function effects(pixels) {
  const tint = {};

  document.querySelectorAll(".tint > input").forEach(input => {
    tint[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] += (tint.rTint / 100) * (255 - pixels.data[i]);
    pixels.data[i + 1] += (tint.gTint / 100) * (255 - pixels.data[i + 1]);
    pixels.data[i + 2] += (tint.bTint / 100) * (255 - pixels.data[i + 2]);
  }

  const split = {};

  document.querySelectorAll(".split > input").forEach(input => {
    split[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 4 * (1280 - split.rShift)] = pixels.data[i];
    pixels.data[i + 1 - 4 * (1280 - split.gShift)] = pixels.data[i + 1];
    pixels.data[i + 2 - 4 * (1280 - split.bShift)] = pixels.data[i + 2];
  }

  const levels = {};

  document.querySelectorAll(".filter > input").forEach(input => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i + 0];
    const green = pixels.data[i + 1];
    const blue = pixels.data[i + 2];
    const alpha = pixels.data[i + 3];

    if (red < levels.rmin
      || green < levels.gmin
      || blue < levels.bmin
      || red > levels.rmax
      || green > levels.gmax
      || blue > levels.bmax) {
      pixels.data[i + 3] = 0;
    }
  }

  const blur = document.querySelector(".blur > input").value;
  context.globalAlpha = 1 - blur / 100;

  return pixels;
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();
  html2canvas(canvas).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.setAttribute("download", "handsome");
    link.innerHTML = `<img src="${link.href}" alt="Handsome">`;
    strip.insertBefore(link, strip.firstChild);
  });
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
