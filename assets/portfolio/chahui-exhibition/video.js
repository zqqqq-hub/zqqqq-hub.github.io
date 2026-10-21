const video = document.querySelector('.video-poster video');
const playButton = document.querySelector('.video-play');
playButton.addEventListener('click', () => {
  if (!video.getAttribute('src')) video.src = video.dataset.src;
  video.play().then(() => { playButton.hidden = true; }).catch(() => { playButton.hidden = false; });
});
