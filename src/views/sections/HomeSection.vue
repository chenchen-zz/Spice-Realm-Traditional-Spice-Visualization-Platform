<template>
  <div class="home-page">
    <div class="home-content">
      <p class="home-eyebrow">Traditional Spice Atlas</p>
      <h1>香域·传统香料可视化平台</h1>
      <p class="home-lead">
        从历史热度、产区空间到贸易流向，重新梳理六大香料在中国文化中的时间脉络与地理路径。
      </p>
    </div>

    <nav class="home-section-nav" aria-label="首页章节导航">
      <button class="section-tile time" @click="scrollTo('time')">
        <span class="tile-mark">时</span>
        <span class="tile-copy">
          <strong>历史热度</strong>
          <small>Dynasty Timeline</small>
        </span>
      </button>
      <button class="section-tile space" @click="scrollTo('space')">
        <span class="tile-mark">空</span>
        <span class="tile-copy">
          <strong>产区地图</strong>
          <small>Origin Map</small>
        </span>
      </button>
      <button class="section-tile flow" @click="scrollTo('flow')">
        <span class="tile-mark">流</span>
        <span class="tile-copy">
          <strong>香料流转</strong>
          <small>Trade Flow</small>
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup>
// 滚动到指定模块（通过自定义事件或直接查找元素）
function scrollTo(sectionId) {
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.home-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 64px clamp(28px, 7vw, 108px);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #fff8ee;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 36%;
  background: linear-gradient(180deg, transparent, rgba(247, 240, 228, 0.96));
  pointer-events: none;
}

.home-content {
  position: relative;
  z-index: 2;
}

.home-content {
  width: min(760px, calc(100% - clamp(300px, 28vw, 420px) - 48px));
  text-align: left;
  padding: clamp(26px, 4vw, 44px) 0;
}

.home-eyebrow {
  margin: 0 0 18px;
  color: #f1c894;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #fff8ee;
  font-size: clamp(42px, 6vw, 78px);
  line-height: 1.02;
  font-weight: 750;
  white-space: nowrap;
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.home-lead {
  max-width: 660px;
  margin: 24px 0 0;
  color: rgba(255, 245, 231, 0.86);
  font-size: clamp(16px, 1.7vw, 21px);
  line-height: 1.9;
}

.home-section-nav {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: clamp(300px, 28vw, 420px);
  height: 100%;
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  border-left: 1px solid rgba(255, 238, 214, 0.12);
  background: rgba(24, 15, 9, 0.16);
  backdrop-filter: blur(3px);
}

.section-tile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  width: 100%;
  min-height: 0;
  padding: clamp(22px, 4vw, 42px);
  border: 0;
  border-bottom: 1px solid rgba(255, 238, 214, 0.1);
  color: #fff8ee;
  text-align: left;
  overflow: hidden;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(255, 248, 237, 0.055), rgba(255, 248, 237, 0.01)),
    rgba(255, 255, 255, 0.012);
  transition:
    background 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;
}

.section-tile:last-child {
  border-bottom: 0;
}

.section-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.24;
  transition: opacity 0.28s ease;
}

.section-tile::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: rgba(247, 200, 140, 0);
  transition:
    background 0.28s ease,
    box-shadow 0.28s ease;
}

.section-tile.time::before {
  background: linear-gradient(135deg, rgba(172, 67, 46, 0.36), transparent 74%);
}

.section-tile.space::before {
  background: linear-gradient(135deg, rgba(72, 124, 103, 0.34), transparent 74%);
}

.section-tile.flow::before {
  background: linear-gradient(135deg, rgba(186, 128, 58, 0.34), transparent 74%);
}

.section-tile:hover {
  transform: translateX(-4px);
  background:
    linear-gradient(135deg, rgba(255, 248, 237, 0.12), rgba(255, 248, 237, 0.035)),
    rgba(255, 255, 255, 0.026);
  box-shadow: -16px 0 42px rgba(0, 0, 0, 0.12);
}

.section-tile:hover::before {
  opacity: 0.58;
}

.section-tile:hover::after {
  background: rgba(247, 200, 140, 0.72);
  box-shadow: 0 0 18px rgba(247, 200, 140, 0.34);
}

.tile-mark,
.tile-copy {
  position: relative;
  z-index: 1;
}

.tile-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(54px, 5vw, 72px);
  height: clamp(54px, 5vw, 72px);
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(255, 248, 237, 0.1);
  border: 1px solid rgba(255, 238, 214, 0.18);
  color: #f8c98c;
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 750;
  box-shadow: inset 0 0 30px rgba(255, 248, 237, 0.06);
  transition:
    background 0.28s ease,
    color 0.28s ease,
    transform 0.28s ease;
}

.section-tile:hover .tile-mark {
  transform: scale(1.035);
  background: rgba(248, 201, 140, 0.78);
  color: #2e1c10;
}

.tile-copy {
  display: grid;
  gap: 8px;
}

.tile-copy strong {
  font-size: clamp(20px, 2.2vw, 30px);
  line-height: 1;
  letter-spacing: 0.04em;
}

.tile-copy small {
  color: rgba(255, 245, 231, 0.68);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .home-page {
    display: grid;
    align-items: end;
    padding: 88px 22px 96px;
  }

  .home-content {
    width: 100%;
    text-align: left;
  }

  h1 {
    font-size: clamp(30px, 8.6vw, 42px);
  }

  .home-section-nav {
    position: relative;
    width: 100%;
    height: auto;
    grid-template-rows: none;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 28px;
    border: 1px solid rgba(255, 238, 214, 0.18);
    border-radius: 24px;
    overflow: hidden;
  }

  .section-tile {
    min-height: 132px;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding: 18px 10px;
    border-right: 1px solid rgba(255, 238, 214, 0.16);
    border-bottom: 0;
    text-align: center;
  }

  .section-tile:last-child {
    border-right: 0;
  }

  .section-tile:hover {
    transform: translateY(-4px);
  }

  .tile-mark {
    width: 52px;
    height: 52px;
    font-size: 28px;
  }

  .tile-copy {
    gap: 6px;
  }

  .tile-copy strong {
    font-size: 16px;
  }

  .tile-copy small {
    font-size: 9px;
    letter-spacing: 0.1em;
  }
}
</style>
