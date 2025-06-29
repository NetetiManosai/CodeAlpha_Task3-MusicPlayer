const audio = new Audio();
const playPauseBtn = document.getElementById('play-pause');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeBar = document.getElementById('volume-bar');
const volume = document.getElementById('volume');
const volumeIcon = document.getElementById('volume-icon');
const songTitleEl = document.getElementById('song-title');
const songArtistEl = document.getElementById('song-artist');
const songDurationEl = document.getElementById('song-duration');
const albumArtEl = document.getElementById('album-art');
const playlistEl = document.getElementById('playlist');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const waveformCanvas = document.getElementById('waveform');
const ctx = waveformCanvas.getContext('2d');
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeating = false;
let shuffledPlaylist = [];
const playlist = [
  {
    title: "Dreamscape",
    artist: "Electronic Vibes",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    art: "https://images.unsplash.com/photo-1507838153414-b4b713384a76"
  },
  {
    title: "Sunset Groove",
    artist: "Chill Beats",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
  },
  {
    title: "Midnight Jam",
    artist: "Night Owls",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"
  },
  {
    title: "Neon Lights",
    artist: "Urban Pulse",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    art: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2"
  }
];
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
function updateDuration() {
  if (!isNaN(audio.duration)) {
    songDurationEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    durationEl.textContent = formatTime(audio.duration);
  } else {
    songDurationEl.textContent = "0:00 / 0:00";
    durationEl.textContent = "0:00";
  }
}
function loadSong(index) {
  const song = playlist[index];
  audio.src = song.src;
  songTitleEl.textContent = song.title;
  songArtistEl.textContent = song.artist;
  albumArtEl.src = song.art;
  songDurationEl.textContent = "0:00 / 0:00"; 
  updatePlaylistUI();
  audio.load(); 
  if (isPlaying) {
    audio.play().catch(err => console.error('Playback failed:', err));
    drawWaveform();
  }
}
function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.textContent = '▶';
    waveformCanvas.classList.remove('playing');
  } else {
    audio.play().catch(err => console.error('Playback failed:', err));
    playPauseBtn.textContent = '⏸';
    waveformCanvas.classList.add('playing');
    drawWaveform();
  }
  isPlaying = !isPlaying;
}
function nextSong() {
  if (isShuffled) {
    currentSongIndex = (shuffledPlaylist.indexOf(currentSongIndex) + 1) % shuffledPlaylist.length;
    currentSongIndex = shuffledPlaylist[currentSongIndex];
  } else {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
  }
  loadSong(currentSongIndex);
}
function previousSong() {
  if (isShuffled) {
    currentSongIndex = (shuffledPlaylist.indexOf(currentSongIndex) - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
    currentSongIndex = shuffledPlaylist[currentSongIndex];
  } else {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  }
  loadSong(currentSongIndex);
}
function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active');
  if (isShuffled) {
    shuffledPlaylist = [...Array(playlist.length).keys()].filter(i => i !== currentSongIndex);
    shuffledPlaylist = shuffledPlaylist.sort(() => Math.random() - 0.5);
    shuffledPlaylist.unshift(currentSongIndex);
  } else {
    shuffledPlaylist = [];
  }
}
function toggleRepeat() {
  isRepeating = !isRepeating;
  repeatBtn.classList.toggle('active');
  audio.loop = isRepeating;
}
function toggleMute() {
  audio.muted = !audio.muted;
  volumeIcon.textContent = audio.muted ? '🔇' : '🔊';
  volume.style.width = audio.muted ? '0%' : `${audio.volume * 100}%`;
}
audio.addEventListener('timeupdate', () => {
  const { currentTime, duration } = audio;
  if (!isNaN(duration)) {
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
    songDurationEl.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }
});
audio.addEventListener('loadedmetadata', updateDuration);
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const width = rect.width;
  const seekTime = (offsetX / width) * audio.duration;
  if (!isNaN(seekTime)) audio.currentTime = seekTime;
});
volumeBar.addEventListener('click', (e) => {
  const rect = volumeBar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const width = rect.width;
  const volumeLevel = offsetX / width;
  audio.volume = volumeLevel;
  audio.muted = false;
  volumeIcon.textContent = '🔊';
  volume.style.width = `${volumeLevel * 100}%`;
});
function updatePlaylistUI() {
  playlistEl.innerHTML = '';
  playlist.forEach((song, index) => {
    const item = document.createElement('div');
    item.className = `playlist-item ${index === currentSongIndex ? 'active' : ''}`;
    item.innerHTML = `
      <img src="${song.art}" alt="${song.title}">
      <div class="playlist-info">
        <p class="playlist-title">${song.title}</p>
        <p class="playlist-artist">${song.artist}</p>
      </div>
    `;
    item.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong(index);
    });
    playlistEl.appendChild(item);
  });
}
function drawWaveform() {
  waveformCanvas.width = albumArtEl.width;
  waveformCanvas.height = albumArtEl.height;
  ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  ctx.fillStyle = 'rgba(255, 71, 87, 0.5)';
  const barCount = 50;
  const barWidth = waveformCanvas.width / barCount;
  for (let i = 0; i < barCount; i++) {
    const height = Math.random() * waveformCanvas.height * 0.4 + 20;
    ctx.fillRect(i * barWidth, (waveformCanvas.height - height) / 2, barWidth - 2, height);
  }
  if (isPlaying) {
    requestAnimationFrame(drawWaveform);
  }
}
audio.addEventListener('ended', () => {
  if (!isRepeating) nextSong();
});
loadSong(currentSongIndex);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayPause();
  } else if (e.code === 'ArrowRight') {
    nextSong();
  } else if (e.code === 'ArrowLeft') {
    previousSong();
  } else if (e.code === 'KeyM') {
    toggleMute();
  } else if (e.code === 'KeyS') {
    toggleShuffle();
  } else if (e.code === 'KeyR') {
    toggleRepeat();
  }
});