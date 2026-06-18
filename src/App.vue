<template>
  <div class="app-shell">
    <video
      class="app-hero-video"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    >
      <source :src="spiceVideo" type="video/mp4" />
    </video>
    <div class="app-video-shade"></div>
    <MainView />
  </div>
</template>

<script setup>
import MainView from './views/MainView.vue'
import spiceVideo from './assets/videos/spice-hero.mp4'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: #fdf6ec;
}

.app-shell {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: #140f0a;
}

.app-hero-video,
.app-video-shade {
  position: absolute;
  inset: 0 0 auto 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}

.app-hero-video {
  object-fit: cover;
  z-index: 0;
  filter: saturate(0.96) contrast(1.06) brightness(0.82);
}

.app-video-shade {
  z-index: 1;
  background:
    radial-gradient(circle at 72% 28%, rgba(196, 132, 67, 0.24), transparent 34%),
    linear-gradient(90deg, rgba(20, 13, 8, 0.86) 0%, rgba(39, 24, 14, 0.58) 45%, rgba(20, 13, 8, 0.78) 100%),
    linear-gradient(180deg, rgba(20, 13, 8, 0.1) 0%, rgba(20, 13, 8, 0.36) 70%, #f7f0e4 100%);
}

.main-layout {
  position: relative;
  z-index: 2;
}
</style>
