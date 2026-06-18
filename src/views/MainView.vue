<template>
  <div class="main-layout">
    <!-- 左侧固定侧边导航栏 -->
    <aside class="global-sidebar">
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          :class="['nav-item', { active: activeSection === item.key }]"
          :aria-current="activeSection === item.key ? 'page' : undefined"
          :aria-label="`跳转到${item.label}`"
          @click="scrollToSection(item.key)"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <template v-if="item.icon === 'overview'">
                <path d="M5 11.2 12 5l7 6.2" />
                <path d="M7.5 10.4v7.1h9v-7.1" />
                <path d="M10.2 17.5v-4.4h3.6v4.4" />
              </template>
              <template v-else-if="item.icon === 'time'">
                <path d="M7.5 5.5h9" />
                <path d="M8.7 5.5c.4 3 2.2 4.8 3.3 6.5-1.1 1.7-2.9 3.5-3.3 6.5" />
                <path d="M15.3 5.5c-.4 3-2.2 4.8-3.3 6.5 1.1 1.7 2.9 3.5 3.3 6.5" />
                <path d="M7.5 18.5h9" />
              </template>
              <template v-else-if="item.icon === 'space'">
                <path d="M12 5.3 18.7 12 12 18.7 5.3 12Z" />
                <path d="m9.8 14.2 1.2-3.2 3.2-1.2-1.2 3.2Z" />
              </template>
              <template v-else>
                <path d="M5.5 8.4c2.5-1.7 4.9-1.7 7.2 0s4.2 1.7 5.8 0" />
                <path d="M5.5 12c2.5-1.7 4.9-1.7 7.2 0s4.2 1.7 5.8 0" />
                <path d="M5.5 15.6c2.5-1.7 4.9-1.7 7.2 0s4.2 1.7 5.8 0" />
              </template>
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 主内容区，左侧留出侧边栏宽度 -->
    <main class="main-content">
      <section ref="homeSectionRef" id="section-home" class="section-block">
        <HomeSection />
      </section>
      <section ref="timeSectionRef" id="section-time" class="section-block">
        <TimeSection />
      </section>
      <section ref="spaceSectionRef" id="section-space" class="section-block">
        <SpaceSection />
      </section>
      <section ref="flowSectionRef" id="section-flow" class="section-block">
        <FlowSection />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HomeSection from './sections/HomeSection.vue'
import TimeSection from './sections/TimeSection.vue'
import SpaceSection from './sections/SpaceSection.vue'
import FlowSection from './sections/FlowSection.vue'

const navItems = [
  { key: 'home', label: '首页', icon: 'overview' },
  { key: 'time', label: '历史热度', icon: 'time' },
  { key: 'space', label: '产区地图', icon: 'space' },
  { key: 'flow', label: '香料流转', icon: 'flow' }
]

const activeSection = ref('home')
const homeSectionRef = ref(null)
const timeSectionRef = ref(null)
const spaceSectionRef = ref(null)
const flowSectionRef = ref(null)

const sectionMap = {
  home: homeSectionRef,
  time: timeSectionRef,
  space: spaceSectionRef,
  flow: flowSectionRef
}

// 滚动到指定模块
function scrollToSection(key) {
  const sectionRef = sectionMap[key]
  if (sectionRef && sectionRef.value) {
    sectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 监听滚动，高亮当前可见模块
function updateActiveSection() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  const offsets = {}

  for (const [key, refItem] of Object.entries(sectionMap)) {
    if (refItem.value) {
      const rect = refItem.value.getBoundingClientRect()
      const absoluteTop = rect.top + scrollTop
      offsets[key] = absoluteTop
    }
  }

  // 找到最接近视口顶部且小于 scrollTop + 100 的模块
  let bestKey = 'home'
  let bestOffset = -Infinity

  for (const [key, offset] of Object.entries(offsets)) {
    if (offset <= scrollTop + 120 && offset > bestOffset) {
      bestOffset = offset
      bestKey = key
    }
  }
  activeSection.value = bestKey
}

let scrollListener = null

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

<style scoped>
.main-layout {
  position: relative;
  min-height: 100vh;
}

/* 左侧固定侧边栏 */
.global-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 80px;
  height: 100vh;
  background: rgba(247, 240, 228, 0.94);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(132, 95, 61, 0.16);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 100;
  box-shadow: 1px 0 16px rgba(67, 42, 29, 0.05);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 100%;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  padding: 10px 8px;
  width: calc(100% - 12px);
  cursor: pointer;
  transition:
    background 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #7a5c48;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 50%;
  width: 2px;
  height: 24px;
  border-radius: 0 999px 999px 0;
  background: #8b5b38;
  opacity: 0;
  transform: translateY(-50%) scaleY(0.6);
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.nav-item .nav-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
}

.nav-item .nav-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.65;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item .nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0;
}

.nav-item:hover {
  background: rgba(139, 91, 56, 0.08);
  border-color: rgba(139, 91, 56, 0.12);
  color: #5a361f;
}

.nav-item.active {
  background: rgba(139, 91, 56, 0.1);
  border-color: rgba(139, 91, 56, 0.18);
  color: #5a361f;
}

.nav-item.active::before {
  opacity: 1;
  transform: translateY(-50%) scaleY(1);
  background: #8b5b38;
}

/* 主内容区，左侧留出侧边栏宽度 */
.main-content {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.section-block {
  width: 100%;
  min-height: 100vh;
}

/* 移动端适配：侧边栏改为顶部横条 */
@media (max-width: 768px) {
  .global-sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    flex-direction: row;
    justify-content: center;
    border-right: none;
    border-top: 1px solid rgba(132, 95, 61, 0.2);
    background: rgba(247, 240, 228, 0.96);
    backdrop-filter: blur(12px);
    z-index: 101;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-around;
    gap: 0;
    max-width: 500px;
    margin: 0 auto;
  }

  .nav-item {
    flex-direction: column;
    padding: 8px 6px;
    width: auto;
    min-width: 62px;
  }

  .nav-item .nav-label {
    font-size: 10px;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding-bottom: 70px;
  }
}
</style>
