document.addEventListener('DOMContentLoaded', function() {
  var wavesurferLeft = WaveSurfer.create({
    container: '#waveformLeft',
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'navy',
    backend: 'WebAudio'
  });

  var wavesurferRight = WaveSurfer.create({
    container: '#waveformRight',
    waveColor: 'lightgreen',
    progressColor: 'green',
    cursorColor: 'navy',
    backend: 'WebAudio'
  });

  function loadTrack(input, side) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);

    if (side === 'left') {
      document.getElementById('trackNameLeft').textContent = file.name;
      wavesurferLeft.load(url);
    } else {
      document.getElementById('trackNameRight').textContent = file.name;
      wavesurferRight.load(url);
    }
  }

  window.loadTrack = loadTrack;

  function togglePlay(wavesurfer, buttonId) {
    wavesurfer.playPause();
    const button = document.getElementById(buttonId);
    button.textContent = wavesurfer.isPlaying() ? 'Pause' : 'Play';
  }

  document.getElementById('playLeft').addEventListener('click', function() {
    togglePlay(wavesurferLeft, 'playLeft');
  });

  document.getElementById('playRight').addEventListener('click', function() {
    togglePlay(wavesurferRight, 'playRight');
  });
  function normalizeSpeed(side) {
    const speedSliderId = side === 'left' ? 'speedLeft' : 'speedRight';
    const speedSlider = document.getElementById(speedSliderId);
    speedSlider.value = 1; // Reset the speed slider to normal (1)

    if (side === 'left') {
      wavesurferLeft.setPlaybackRate(1); // Reset the left track speed to normal
    } else {
      wavesurferRight.setPlaybackRate(1); // Reset the right track speed to normal
    }
  }

  document.getElementById('normalizeSpeedLeft').addEventListener('click', function() {
    normalizeSpeed('left');
  });

  document.getElementById('normalizeSpeedRight').addEventListener('click', function() {
    normalizeSpeed('right');
  });
  function adjustVolumeAndColor() {
    const balanceSlider = document.getElementById('colorSlider');
    const balanceValue = balanceSlider.value;
    const volumeLeftValue = document.getElementById('volumeLeft').value;
    const volumeRightValue = document.getElementById('volumeRight').value;

    const volumeLeft = balanceValue <= 50 ? volumeLeftValue / 100 : volumeLeftValue / 100 * (1 - 2 * (balanceValue - 50) / 100);
    const volumeRight = balanceValue >= 50 ? volumeRightValue / 100 : volumeRightValue / 100 * (1 - 2 * (50 - balanceValue) / 100);

    wavesurferLeft.setVolume(volumeLeft);
    wavesurferRight.setVolume(volumeRight);

    const colorBox = document.getElementById('colorBox');
    const gradientPercentage = 100 - balanceValue;
    colorBox.style.background = `linear-gradient(to right, #3498db ${gradientPercentage}%, #e74c3c ${gradientPercentage}%)`;
  }

  document.getElementById('colorSlider').addEventListener('input', adjustVolumeAndColor);
  document.getElementById('volumeLeft').addEventListener('input', adjustVolumeAndColor);
  document.getElementById('volumeRight').addEventListener('input', adjustVolumeAndColor);
  function updateTimeCounters(wavesurfer, currentTimeId, totalTimeId) {
    const currentTimeElem = document.getElementById(currentTimeId);
    const totalTimeElem = document.getElementById(totalTimeId);

    wavesurfer.on('audioprocess', function() {
      currentTimeElem.textContent = formatTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('ready', function() {
      totalTimeElem.textContent = formatTime(wavesurfer.getDuration());
    });

    wavesurfer.on('seek', function() {
      currentTimeElem.textContent = formatTime(wavesurfer.getCurrentTime());
    });
  }

  // Function to format time in MM:SS format
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  // Call updateTimeCounters for each wavesurfer instance after loading a track
  function loadTrack(input, side) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);

    if (side === 'left') {
      document.getElementById('trackNameLeft').textContent = file.name;
      wavesurferLeft.load(url);
      wavesurferLeft.on('ready', function() {
        updateTimeCounters(wavesurferLeft, 'currentTimeLeft', 'totalTimeLeft');
      });
    } else {
      document.getElementById('trackNameRight').textContent = file.name;
      wavesurferRight.load(url);
      wavesurferRight.on('ready', function() {
        updateTimeCounters(wavesurferRight, 'currentTimeRight', 'totalTimeRight');
      });
    }
  }

  window.loadTrack = loadTrack;
function adjustPlaybackRate(side) {
  const sliderId = side === 'left' ? 'speedLeft' : 'speedRight';
  const speedValue = document.getElementById(sliderId).value;

  // Remember the current playtime as a percentage of the total duration
  let wavesurfer = side === 'left' ? wavesurferLeft : wavesurferRight;
  const currentTime = wavesurfer.getCurrentTime();
  const totalTime = wavesurfer.getDuration();
  const currentPercentage = currentTime / totalTime;

  // Adjust the playback rate
  wavesurfer.setPlaybackRate(parseFloat(speedValue));

  // Seek to the remembered playtime
  wavesurfer.seekTo(currentPercentage);
}


  document.getElementById('speedLeft').addEventListener('input', function() {
    adjustPlaybackRate('left');
  });

  document.getElementById('speedRight').addEventListener('input', function() {
    adjustPlaybackRate('right');
  });

  function setupSeekSlider(wavesurfer, sliderId) {
    const seekSlider = document.getElementById(sliderId);
    seekSlider.addEventListener('input', function() {
      const percentage = this.value;
      wavesurfer.seekTo(percentage);
    });

    seekSlider.addEventListener('mousedown', function() {
      this.setAttribute('moving', 'true');
    });

    seekSlider.addEventListener('mouseup', function() {
      this.removeAttribute('moving');
    });

    wavesurfer.on('audioprocess', function() {
      if (!seekSlider.getAttribute('moving')) {
        const currentTime = wavesurfer.getCurrentTime();
        const totalTime = wavesurfer.getDuration();
        const percentage = (currentTime / totalTime);
        seekSlider.value = percentage;
      }
    });
  }

  setupSeekSlider(wavesurferLeft, 'seekLeft');
  setupSeekSlider(wavesurferRight, 'seekRight');
});