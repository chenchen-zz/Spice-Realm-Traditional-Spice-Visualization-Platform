<template>
  <div class="view-page">
    <section class="hero">
      <div class="hero-copy" :style="{ '--hero-image': `url(${landscapeImage})` }">
        <div class="hero-main">
          <!-- 删除了返回首页按钮 -->
          <p class="eyebrow">空间识别 · 产区地图</p>
          <h1>六大香料的地理肌理</h1>
          <p class="hero-text">
            以高德地图为底图，串联香料产区、集散节点与文化价值。
            图标区分品类，尺度映射产量，点击即可联动产区档案与多维雷达分析。
          </p>
        </div>
        <div class="hero-cards">
          <div class="metric-card">
            <span>产区数</span>
            <strong>{{ regions.length }}</strong>
          </div>
          <div class="metric-card">
            <span>当前筛选</span>
            <strong>{{ selectedSpiceLabel }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel map-panel">
        <div class="panel-head">
          <div>
            <p class="panel-title">中国传统香料产区互动地图</p>
            <p class="panel-subtitle">点击香料筛选后，地图会按产量深浅强化显示对应产区。</p>
          </div>
          <div class="panel-badge">AMap + ECharts</div>
        </div>

        <div class="spice-chips">
          <button
            v-for="item in spiceOptions"
            :key="item.value"
            :class="['chip', { active: selectedSpice === item.value }]"
            :style="selectedSpice === item.value ? { '--chip-color': item.color } : {}"
            @click="selectedSpice = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="map-shell">
          <div ref="mapRef" class="map-canvas"></div>
          <div
            v-if="!mapError && selectedRegion"
            class="map-floating-card"
            :style="{ '--floating-accent': selectedRegionColor }"
            tabindex="0"
          >
            <div class="floating-trigger" :title="`当前产区：${selectedRegion.name}`">
              <span class="floating-trigger-core">{{ selectedRegion.spiceName.slice(0, 1) }}</span>
            </div>
            <div class="floating-panel">
              <div class="floating-head">
                <div>
                  <p class="floating-kicker">当前产区</p>
                  <h3>{{ selectedRegion.name }}</h3>
                </div>
                <div class="floating-head-meta">
                  <span class="floating-chip" :style="{ backgroundColor: selectedRegionColor }">
                    {{ selectedRegion.spiceName }}
                  </span>
                  <span class="floating-chip subtle">
                    {{ selectedRegion.regionType }}
                  </span>
                </div>
              </div>
              <p class="floating-text">{{ selectedRegion.modernDesc }}</p>
              <div class="floating-meta">
                <span>产量 {{ selectedRegion.output }}</span>
                <span>{{ selectedRegion.tradeRole }}</span>
                <span>{{ selectedRegion.regionType }}</span>
              </div>
              <div class="floating-actions">
                <button class="floating-button primary" @click="focusRegion(selectedRegion)">
                  定位当前产区
                </button>
                <button class="floating-button" @click="resetMapViewport">
                  重置视野
                </button>
              </div>
            </div>
          </div>
          <div v-if="!mapError" class="map-tip-bar">
            点击地图标记切换产区，右侧档案与雷达图会同步更新
          </div>
          <div v-if="mapError" class="map-overlay">
            <h3>高德地图尚未完成初始化</h3>
            <p>{{ mapError }}</p>
            <p>你可以先查看右侧产区资料与雷达图，配置 `VITE_AMAP_KEY` 后地图会自动接入。</p>
          </div>
        </div>

        <div class="legend-row">
          <div v-for="spice in spiceCatalog" :key="spice.id" class="legend-item">
            <span class="legend-dot" :style="{ backgroundColor: spice.color }"></span>
            <span>{{ spice.name }}</span>
          </div>
        </div>
      </article>

      <aside v-if="selectedRegion" class="panel side-panel">
        <div class="panel-head compact">
          <div>
            <p class="panel-title">产区档案</p>
            <p class="panel-subtitle">{{ selectedRegion.regionType }} · {{ selectedRegion.spiceName }}</p>
          </div>
        </div>

        <div class="highlight-card">
          <p class="highlight-label">{{ selectedRegion.name }}</p>
          <h2>{{ selectedRegion.tagline }}</h2>
          <p class="highlight-text">{{ selectedRegion.modernDesc }}</p>
        </div>

        <div class="snapshot-strip">
          <div class="snapshot-item">
            <span>产量指数</span>
            <strong>{{ selectedRegion.output }}</strong>
          </div>
          <div class="snapshot-item">
            <span>产区类型</span>
            <strong>{{ selectedRegion.regionType }}</strong>
          </div>
          <div class="snapshot-item">
            <span>贸易角色</span>
            <strong>{{ selectedRegion.tradeRole }}</strong>
          </div>
          <div class="snapshot-item">
            <span>坐标</span>
            <strong>{{ selectedRegion.coords[1].toFixed(1) }}, {{ selectedRegion.coords[0].toFixed(1) }}</strong>
          </div>
        </div>

        <div class="detail-grid">
          <div ref="radarRef" class="radar-shell"></div>

          <div class="region-list">
            <div class="list-head">
              <p>可切换产区</p>
              <span>{{ visibleRegions.length }} 个</span>
            </div>
            <button
              v-for="region in visibleRegions"
              :key="region.id"
              :class="['region-card', { active: region.id === selectedRegion.id }]"
              @click="focusRegion(region)"
            >
              <div>
                <strong>{{ region.name }}</strong>
                <p>{{ region.spiceName }} · 产量 {{ region.output }}</p>
              </div>
              <span>{{ region.tradeRole }}</span>
            </button>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import landscapeImage from '../../assets/images/landscape.png'
// 删除了 useRouter 和 goBack

const spiceCatalog = ref([])

const layers = [
  { value: 'modern', label: '现代产区' },
]

const regions = ref([])

async function loadSpaceData() {
  const [catRes, regRes] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}data/space-catalog.json`),
    fetch(`${import.meta.env.BASE_URL}data/space-regions.json`),
  ])
  const catJson = await catRes.json()
  const regJson = await regRes.json()
  spiceCatalog.value = catJson.data.catalog
  regions.value = regJson.data.regions
}

const spiceOptions = computed(() => [
  { value: 'all', label: '全部香料', color: '#8b5b38' },
  ...spiceCatalog.value.map((item) => ({ value: item.id, label: item.name, color: item.color })),
])

const selectedSpice = ref('all')
const selectedRegion = ref(null)
const mapRef = ref(null)
const radarRef = ref(null)
const mapError = ref('')
const chartFont = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif"

const amapKey = window.__AMAP_KEY__ || import.meta.env.VITE_AMAP_KEY || ''
const amapSecurityCode =
  window.__AMAP_SECURITY_CODE__ || import.meta.env.VITE_AMAP_SECURITY_CODE || ''

const visibleRegions = computed(() =>
  selectedSpice.value === 'all'
    ? regions.value
    : regions.value.filter((region) => region.spice === selectedSpice.value),
)

const selectedSpiceLabel = computed(
  () => spiceOptions.value.find((item) => item.value === selectedSpice.value)?.label || '全部香料',
)

const selectedRegionColor = computed(
  () => spiceCatalog.value.find((item) => item.id === selectedRegion.value?.spice)?.color || '#8b5b38',
)

let mapInstance = null
let AMapRef = null
let radarChart = null
let radarResizeObserver = null
let resizeFrame = 0
let markerRecords = []
let circleRecords = []

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '')
  const bigint = Number.parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function markerHtml(region, isActive) {
  const spice = spiceCatalog.value.find((item) => item.id === region.spice)
  if (!spice) return ''
  const size = 28 + Math.round(region.output / 5)
  return `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:18px 18px 18px 4px;
      background:linear-gradient(135deg, ${spice.color}, ${hexToRgba(spice.color, 0.65)});
      color:#fff8f0;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:15px;
      font-weight:700;
      font-family:'Microsoft YaHei','PingFang SC','Noto Sans SC',system-ui,sans-serif;
      border:${isActive ? 3 : 2}px solid rgba(255,255,255,0.88);
      box-shadow:0 12px 24px ${hexToRgba(spice.color, isActive ? 0.42 : 0.26)};
      transform:${isActive ? 'scale(1.08)' : 'scale(1)'};
      position:relative;
    ">${spice.short}</div>
  `
}

function syncSelectedRegion() {
  if (!visibleRegions.value.length) return
  if (!selectedRegion.value || !visibleRegions.value.some((region) => region.id === selectedRegion.value.id)) {
    selectedRegion.value = visibleRegions.value[0] || regions.value[0] || null
  }
}

function renderMapOverlays({ fitView = false } = {}) {
  if (!mapInstance || !AMapRef) return
  if (!visibleRegions.value.length) return

  if (markerRecords.length) {
    mapInstance.remove(markerRecords)
    markerRecords = []
  }
  if (circleRecords.length) {
    mapInstance.remove(circleRecords)
    circleRecords = []
  }

  visibleRegions.value.forEach((region) => {
    const spice = spiceCatalog.value.find((item) => item.id === region.spice)
    const isActive = selectedRegion.value?.id === region.id
    const size = 28 + Math.round(region.output / 5)
    const marker = new AMapRef.Marker({
      position: region.coords,
      content: markerHtml(region, isActive),
      offset: new AMapRef.Pixel(-size / 2, -size / 2),
      anchor: 'bottom-center',
      zIndex: isActive ? 140 : 110,
    })
    const circle = new AMapRef.Circle({
      center: region.coords,
      radius: 25000 + region.output * (isActive ? 760 : 650),
      strokeColor: spice.color,
      strokeOpacity: selectedSpice.value === 'all' ? (isActive ? 0.48 : 0.22) : isActive ? 0.65 : 0.38,
      strokeWeight: isActive ? 3 : 1,
      fillColor: spice.color,
      fillOpacity:
        selectedSpice.value === 'all'
          ? isActive
            ? 0.14
            : 0.05
          : isActive
            ? Math.min(0.2 + region.output / 560, 0.34)
            : Math.min(0.09 + region.output / 800, 0.18),
    })
    marker.on('click', () => {
      selectedRegion.value = region
      if (mapInstance) {
        mapInstance.setCenter(region.coords)
      }
    })
    markerRecords.push(marker)
    circleRecords.push(circle)
  })

  mapInstance.add([...circleRecords, ...markerRecords])
  if (fitView && markerRecords.length) {
    mapInstance.setFitView(markerRecords, false, [72, 72, 320, 90])
  }
}

function applyMapStyle() {
  if (!mapInstance) return
  mapInstance.setMapStyle('amap://styles/whitesmoke')
}

function updateRadar() {
  if (!radarRef.value) return
  if (!selectedRegion.value) return
  if (!radarChart) {
    radarChart = echarts.init(radarRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true,
    })
  }
  const spice = spiceCatalog.value.find((item) => item.id === selectedRegion.value.spice)
  radarChart.setOption({
    backgroundColor: 'transparent',
    animationDuration: 700,
    textStyle: {
      fontFamily: chartFont,
    },
    radar: {
      center: ['50%', '52%'],
      radius: '50%',
      splitNumber: 4,
      nameGap: 6,
      axisName: {
        color: '#735744',
        fontSize: 11,
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255,248,240,0.9)', 'rgba(246,235,220,0.7)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(138, 103, 72, 0.16)',
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(138, 103, 72, 0.2)',
        },
      },
      indicator: [
        { name: '资源\n禀赋', max: 100 },
        { name: '历史\n记载', max: 100 },
        { name: '贸易\n地位', max: 100 },
        { name: '文化\n象征', max: 100 },
        { name: '药用\n价值', max: 100 },
        { name: '保护\n潜力', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: selectedRegion.value.radar,
            name: selectedRegion.value.name,
            lineStyle: {
              width: 2,
              color: spice.color,
            },
            itemStyle: {
              color: spice.color,
            },
            areaStyle: {
              color: hexToRgba(spice.color, 0.28),
            },
          },
        ],
      },
    ],
  })
}

async function initMap() {
  if (!amapKey) {
    mapError.value = '未检测到高德地图 Key。'
    return
  }

  if (!amapSecurityCode) {
    mapError.value = '未检测到高德地图安全密钥。'
    return
  }

  try {
    window._AMapSecurityConfig = {
      securityJsCode: amapSecurityCode,
    }
    AMapRef = await AMapLoader.load({
      key: amapKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })
    mapInstance = new AMapRef.Map(mapRef.value, {
      center: [104.5, 33.8],
      zoom: 4.2,
      viewMode: '2D',
      mapStyle: 'amap://styles/whitesmoke',
      zooms: [3, 8],
    })
    mapInstance.addControl(new AMapRef.Scale())
    mapInstance.addControl(new AMapRef.ToolBar({ position: 'RB' }))
    applyMapStyle()
    renderMapOverlays({ fitView: true })
  } catch (error) {
    mapError.value = '地图资源加载失败，请检查网络、Key 或安全配置。'
  }
}

function handleResize() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    radarChart?.resize()
  })
}

function focusRegion(region) {
  selectedRegion.value = region
  if (mapInstance) {
    mapInstance.setCenter(region.coords)
    mapInstance.setZoom(5.4)
  }
}

function resetMapViewport() {
  if (!mapInstance) return
  renderMapOverlays({ fitView: true })
}

watch(selectedSpice, () => {
  syncSelectedRegion()
  renderMapOverlays({ fitView: true })
  updateRadar()
})

watch(
  () => selectedRegion.value?.id,
  () => {
    updateRadar()
    if (mapInstance) {
      renderMapOverlays()
    }
  },
)

onMounted(async () => {
  await loadSpaceData()
  syncSelectedRegion()
  updateRadar()
  initMap()
  if (radarRef.value) {
    radarResizeObserver = new ResizeObserver(handleResize)
    radarResizeObserver.observe(radarRef.value)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  radarResizeObserver?.disconnect()
  radarResizeObserver = null
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  radarChart?.dispose()
  radarChart = null
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<style scoped>
/* 完全保留原样式，仅移除 .back-button 相关（原样式中本就有 .back-button 定义，保留不影响） */
.view-page {
  min-height: 100vh;
  padding: clamp(20px, 2.6vw, 30px);
  background:
    radial-gradient(circle at top left, rgba(214, 178, 127, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(126, 61, 44, 0.12), transparent 24%),
    linear-gradient(180deg, #f7f0e4 0%, #f3eadc 48%, #efe2d1 100%);
  color: #4a3425;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  letter-spacing: 0;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(280px, 0.9fr);
  gap: 18px;
  margin-bottom: 18px;
  align-items: stretch;
}

.hero-copy,
.hero-cards,
.panel {
  border: 1px solid rgba(132, 95, 61, 0.15);
  background: rgba(255, 249, 240, 0.86);
  box-shadow: 0 20px 45px rgba(82, 50, 32, 0.08);
  backdrop-filter: blur(8px);
}

.hero-copy {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.72fr);
  gap: 18px;
  align-items: stretch;
  border-radius: 22px;
  padding: 20px 24px 22px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 249, 240, 0.92) 0%, rgba(255, 249, 240, 0.72) 50%, rgba(255, 249, 240, 0.16) 100%),
    linear-gradient(135deg, rgba(94, 139, 87, 0.1), rgba(255, 249, 240, 0.08));
}

.hero-copy::before {
  content: '';
  position: absolute;
  inset: -18px;
  background-image: var(--hero-image);
  background-size: cover;
  background-position: center right;
  opacity: 0.5;
  filter: blur(1.5px) saturate(0.9) contrast(1);
  transform: scale(1.025);
}

.hero-copy::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 30%, rgba(111, 146, 112, 0.12), transparent 32%),
    linear-gradient(90deg, rgba(255, 249, 240, 0.96), rgba(255, 249, 240, 0.66) 50%, rgba(255, 249, 240, 0.16));
}

.hero-copy > * {
  position: relative;
  z-index: 1;
}

.hero-main {
  align-self: center;
}

.back-button {
  /* 保留样式，但模板中已删除按钮，不影响显示 */
  border: none;
  border-radius: 999px;
  background: #8b5b38;
  color: #fff9f2;
  padding: 10px 18px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  padding: 4px 9px 4px 6px;
  border: 1px solid rgba(157, 107, 69, 0.2);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(94, 139, 87, 0.14), rgba(255, 249, 240, 0.5));
  color: #6d6743;
  letter-spacing: 0.04em;
  font-size: 12px;
  font-weight: 700;
}

.eyebrow::before {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, #fff8ec 0 30%, transparent 32%),
    linear-gradient(135deg, #5e8b57, #d4a565);
  box-shadow: 0 4px 10px rgba(94, 139, 87, 0.18);
}

h1 {
  margin: 0;
  font-size: clamp(30px, 3.2vw, 40px);
  line-height: 1.18;
  font-weight: 750;
  color: #4b2f1d;
  letter-spacing: 0;
}

.hero-text {
  margin: 10px 0 0;
  max-width: 760px;
  line-height: 1.6;
  color: #6c5442;
  font-size: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(139, 91, 56, 0.12);
}

.hero-cards {
  border-radius: 18px;
  padding: 12px;
  display: grid;
  gap: 10px;
  align-self: stretch;
  border: 1px solid rgba(255, 248, 238, 0.36);
  background:
    linear-gradient(180deg, rgba(255, 250, 244, 0.28), rgba(255, 250, 244, 0.12)),
    rgba(86, 54, 32, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.52),
    0 18px 40px rgba(72, 43, 24, 0.1);
  backdrop-filter: blur(14px) saturate(1.08);
}

.metric-card {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  padding: 12px 14px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.56), rgba(255, 244, 228, 0.28)),
    rgba(255, 249, 240, 0.26);
  border: 1px solid rgba(255, 248, 238, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.52),
    inset 0 -1px 0 rgba(132, 95, 61, 0.05);
}

.metric-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(94, 139, 87, 0.32), transparent);
}

.metric-card span {
  display: block;
  font-size: 12px;
  color: rgba(93, 63, 39, 0.72);
  margin-bottom: 6px;
  font-weight: 650;
}

.metric-card strong {
  font-size: 25px;
  line-height: 1.12;
  color: #4f2f1c;
  font-weight: 760;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(300px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.map-panel,
.side-panel {
  min-width: 0;
}

.map-panel {
  display: flex;
  flex-direction: column;
}

.panel {
  border-radius: 22px;
  padding: 20px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.panel-head > div {
  min-width: 0;
}

.panel-head.compact {
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #523421;
}

.panel-subtitle {
  margin: 6px 0 0;
  color: #886950;
  line-height: 1.58;
  font-size: 14px;
}

.layer-switch,
.spice-chips,
.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.switch-button,
.chip,
.region-card {
  transition: all 0.25s ease;
}

.switch-button {
  border: 1px solid rgba(145, 105, 69, 0.16);
  background: rgba(255, 255, 255, 0.75);
  color: #6d513d;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
}

.switch-button.active {
  background: linear-gradient(135deg, #8b5b38, #ad7c50);
  color: #fff8f2;
}

.chip {
  border: 1px solid rgba(145, 105, 69, 0.14);
  background: rgba(255, 255, 255, 0.68);
  color: #6b513d;
  border-radius: 999px;
  padding: 9px 14px;
  cursor: pointer;
}

.chip.active {
  color: #fffaf3;
  border-color: transparent;
  background: linear-gradient(135deg, var(--chip-color), #c08d5d);
  box-shadow: 0 10px 22px rgba(139, 91, 56, 0.22);
}

.map-shell {
  position: relative;
  height: 450px;
  flex: 1;
  min-height: 450px;
  border-radius: 20px;
  overflow: hidden;
  margin-top: 14px;
  background:
    linear-gradient(180deg, rgba(240, 231, 217, 0.96), rgba(234, 220, 202, 0.96)),
    repeating-linear-gradient(
      90deg,
      rgba(140, 106, 75, 0.04) 0,
      rgba(140, 106, 75, 0.04) 1px,
      transparent 1px,
      transparent 32px
    );
  border: 1px solid rgba(141, 104, 72, 0.12);
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-floating-card {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 12;
  width: 56px;
  height: 56px;
}

.floating-trigger {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--floating-accent), rgba(255, 250, 243, 0.95));
  border: 1px solid rgba(255, 248, 240, 0.75);
  box-shadow: 0 16px 32px rgba(67, 42, 29, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-radius 0.25s ease;
}

.floating-trigger-core {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 250, 243, 0.9);
  color: #5e3c27;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.floating-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(300px, calc(100vw - 72px));
  padding: 14px 14px 12px;
  border-radius: 18px;
  background: rgba(255, 250, 243, 0.92);
  border: 1px solid rgba(133, 97, 66, 0.14);
  box-shadow: 0 14px 30px rgba(67, 42, 29, 0.12);
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
  transform-origin: top right;
  pointer-events: none;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.map-floating-card:hover .floating-trigger,
.map-floating-card:focus-within .floating-trigger {
  transform: scale(1.04);
  box-shadow: 0 18px 34px rgba(67, 42, 29, 0.18);
}

.map-floating-card:hover .floating-panel,
.map-floating-card:focus-within .floating-panel {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.floating-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.floating-head-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.floating-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #9b6d49;
  text-transform: uppercase;
}

.floating-head h3 {
  margin: 0;
  font-size: 17px;
  color: #4f2f1c;
}

.floating-text {
  margin: 12px 0 0;
  line-height: 1.68;
  color: #6f5846;
  font-size: 13px;
}

.floating-chip {
  flex-shrink: 0;
  color: #fffaf3;
  border-radius: 999px;
  padding: 6px 9px;
  font-size: 11px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.floating-chip.subtle {
  background: rgba(240, 228, 211, 0.95) !important;
  color: #6e5542;
  box-shadow: none;
}

.floating-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.floating-meta span {
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(240, 228, 211, 0.9);
  color: #725742;
  font-size: 11px;
}

.floating-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.floating-button {
  border: 1px solid rgba(139, 91, 56, 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: #6b513d;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
}

.floating-button.primary {
  border-color: transparent;
  background: linear-gradient(135deg, #8b5b38, #ad7c50);
  color: #fff9f1;
}

.map-tip-bar {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 11;
  max-width: calc(100% - 380px);
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(81, 58, 43, 0.76);
  color: #fff4e8;
  font-size: 13px;
  backdrop-filter: blur(8px);
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  text-align: center;
  background: rgba(244, 234, 221, 0.92);
  color: #6b513d;
}

.map-overlay h3 {
  margin: 0 0 10px;
  color: #4f2f1c;
}

.map-overlay p {
  margin: 0 0 8px;
  line-height: 1.8;
  max-width: 420px;
}

.legend-row {
  margin-top: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.64);
  color: #6e5542;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
}

.highlight-card {
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.94), rgba(245, 234, 220, 0.94));
  border: 1px solid rgba(150, 116, 83, 0.12);
}

.highlight-label {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #9f6e49;
  text-transform: uppercase;
}

.highlight-card h2 {
  margin: 0 0 10px;
  color: #4f2f1c;
}

.highlight-text {
  margin: 0;
  line-height: 1.62;
  color: #6f5846;
  min-height: 3.24em;
  max-height: 3.24em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.snapshot-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.snapshot-item {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(145, 105, 69, 0.12);
}

.snapshot-item span {
  display: block;
  color: #8b6b50;
  font-size: 12px;
  margin-bottom: 6px;
}

.snapshot-item strong {
  color: #563521;
  font-size: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: 10px;
  align-items: stretch;
}

.radar-shell {
  min-height: 238px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.9), rgba(244, 232, 216, 0.86));
  border: 1px solid rgba(146, 109, 77, 0.12);
}

.region-list {
  display: grid;
  gap: 8px;
  max-height: 232px;
  overflow: auto;
  padding-right: 4px;
}

.region-list::-webkit-scrollbar {
  width: 6px;
}

.region-list::-webkit-scrollbar-thumb {
  background: rgba(139, 91, 56, 0.22);
  border-radius: 999px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.list-head p,
.list-head span {
  margin: 0;
  color: #7d614b;
  font-size: 12px;
}

.region-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(145, 105, 69, 0.14);
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}

.region-card strong {
  color: #54331f;
}

.region-card p,
.region-card span {
  margin: 6px 0 0;
  color: #7d614b;
  font-size: 13px;
}

.region-card.active {
  border-color: rgba(139, 91, 56, 0.26);
  background: linear-gradient(135deg, rgba(255, 248, 241, 0.98), rgba(243, 229, 210, 0.94));
  box-shadow: 0 12px 28px rgba(128, 87, 56, 0.12);
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    grid-template-columns: 1fr;
  }

  .hero-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .view-page {
    padding: 16px;
  }

  h1 {
    font-size: 30px;
  }

  .hero-copy,
  .hero-cards,
  .panel {
    border-radius: 18px;
  }

  .map-shell {
    height: 390px;
    min-height: 390px;
  }

  .map-floating-card {
    top: auto;
    right: 12px;
    left: 12px;
    bottom: 12px;
    width: auto;
    height: auto;
  }

  .floating-trigger {
    display: none;
  }

  .floating-panel {
    position: static;
    width: auto;
    padding: 16px;
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .floating-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .floating-actions {
    flex-direction: column;
  }

  .map-tip-bar {
    left: 12px;
    right: 12px;
    bottom: 226px;
    max-width: none;
    border-radius: 14px;
  }

  .snapshot-strip,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .region-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
