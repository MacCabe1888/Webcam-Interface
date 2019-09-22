const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const context = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

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
    canvas.style.backgroundImage = `url("${reader.result}")`;
  }
  
  if (file) {
    reader.readAsDataURL(file);
  }
}

function effects(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb > input").forEach(input => {
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
