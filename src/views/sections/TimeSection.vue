<template>
  <div class="view-page">
    <section class="hero">
      <div class="hero-copy" :style="{ '--hero-image': `url(${bookImage})` }">
        <div class="hero-main">
          <!-- 删除了返回首页按钮 -->
          <p class="eyebrow">时序观察 · 历史热度</p>
          <h1>六大香料的时代曲线</h1>
          <p class="hero-text">
            以唐、宋、元、明、清为时间轴，整合古籍提及、贸易活跃与考古线索，
            在同一张堆叠面积图中呈现香料热度的起伏、分化与文化转向。
          </p>
        </div>
        <div class="hero-cards">
          <div class="metric-card">
            <span>当前朝代</span>
            <strong>{{ selectedRecord.dynasty }}</strong>
          </div>
          <div class="metric-card">
            <span>总热度指数</span>
            <strong>{{ selectedRecord.total }}</strong>
          </div>
          <div class="metric-card">
            <span>主导香料</span>
            <strong>{{ selectedRecord.topSpice.name }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel chart-panel">
        <div class="panel-head">
          <div>
            <p class="panel-title">历史使用热度堆叠图</p>
            <p class="panel-subtitle">点击面积或红旗可切换朝代详情，hover 查看事件背景。</p>
          </div>
          <div class="panel-badge">ECharts Stacked Area</div>
        </div>
        <div ref="chartRef" class="chart-shell"></div>
        <div class="dynasty-tabs">
          <button
            v-for="item in timelineRecords"
            :key="item.dynasty"
            :class="['dynasty-tab', { active: item.dynasty === selectedDynasty }]"
            @click="selectDynasty(item.dynasty)"
          >
            {{ item.dynasty }}
          </button>
        </div>
      </article>

      <aside class="panel side-panel">
        <div class="panel-head compact">
          <div>
            <p class="panel-title">朝代解读</p>
            <p class="panel-subtitle">{{ selectedNarrative.summary }}</p>
          </div>
        </div>

        <div class="highlight-card">
          <p class="highlight-label">结构观察</p>
          <h2>{{ selectedRecord.topSpice.name }}占比最高</h2>
          <p class="highlight-text">
            在{{ selectedRecord.dynasty }}阶段，{{ selectedRecord.topSpice.name }}热度为
            {{ selectedRecord.topSpice.value }}，约占总量的 {{ selectedRecord.topRatio }}%。
          </p>
        </div>

        <div class="spice-list">
          <div v-for="spice in selectedRecord.spices" :key="spice.name" class="spice-row">
            <div class="spice-meta">
              <span class="spice-dot" :style="{ backgroundColor: spice.color }"></span>
              <span>{{ spice.name }}</span>
            </div>
            <div class="spice-bar">
              <div
                class="spice-bar-fill"
                :style="{
                  width: `${Math.round((spice.value / selectedRecord.topSpice.value) * 100)}%`,
                  background: `linear-gradient(90deg, ${spice.color}, rgba(255,255,255,0.2))`,
                }"
              ></div>
            </div>
            <strong>{{ spice.value }}</strong>
          </div>
        </div>

        <div class="event-card">
          <p class="event-kicker">历史旗标</p>
          <h3>{{ selectedNarrative.event.title }}</h3>
          <p>{{ selectedNarrative.event.description }}</p>
          <p class="event-impact">影响：{{ selectedNarrative.event.impact }}</p>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import bookImage from '../../assets/images/books.png'
import dynastyEvents from '../../data/events/dynasty-events.json'

// 删除了 useRouter 和 goBack

const chartRef = ref(null)
const selectedDynasty = ref('宋')
const chartFont = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif"

const palette = {
  沉香: '#7b4b2a',
  檀香: '#b87a3b',
  龙涎香: '#4d7188',
  麝香: '#7e2f2f',
  丁香: '#8f5aa8',
  藿香: '#5e8b57',
}

const historyDataset = ref([])
const eventMap = ref({})
const narrativeMap = ref({})

function buildEventMap() {
  const groupedEvents = {}

  dynastyEvents.forEach((item) => {
    if (!groupedEvents[item.dynasty]) {
      groupedEvents[item.dynasty] = []
    }
    groupedEvents[item.dynasty].push(item)
  })

  Object.entries(groupedEvents).forEach(([dynasty, events]) => {
    const sortedEvents = [...events].sort((a, b) => a.year - b.year)
    eventMap.value[dynasty] = {
      title: sortedEvents.map((item) => item.event).join('与'),
      description: sortedEvents
        .map((item) => `${item.year}年${item.event}，${item.effect}`)
        .join('；'),
      impact: sortedEvents.map((item) => item.effect).join('；'),
    }
  })
}

async function loadTimeData() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/time-heatmap.json`)
  const json = await res.json()
  historyDataset.value = json.data.dynasties
  buildEventMap()
  json.data.narratives.forEach((n) => { narrativeMap.value[n.dynasty] = n.summary })
}

const spiceNames = ['沉香', '檀香', '龙涎香', '麝香', '丁香', '藿香']

const timelineRecords = computed(() =>
  historyDataset.value.map((row) => {
    const spices = spiceNames.map((name) => ({
      name,
      value: row[name],
      color: palette[name],
    }))
    const total = spices.reduce((sum, item) => sum + item.value, 0)
    const topSpice = [...spices].sort((a, b) => b.value - a.value)[0]
    return {
      dynasty: row.dynasty,
      total,
      spices,
      topSpice,
      topRatio: ((topSpice.value / total) * 100).toFixed(1),
    }
  }),
)

const selectedRecord = computed(() => {
  const found = timelineRecords.value.find((item) => item.dynasty === selectedDynasty.value)
  return found || timelineRecords.value[0] || { dynasty: '加载中...', total: 0, spices: [], topSpice: { name: '', value: 0 }, topRatio: '0' }
})

const selectedNarrative = computed(() => ({
  summary: narrativeMap.value[selectedDynasty.value] || '',
  event: eventMap.value[selectedDynasty.value] || {},
}))

let chartInstance = null

function selectDynasty(dynasty) {
  if (!dynasty) return
  const exists = historyDataset.value.some((row) => row.dynasty === dynasty)
  if (exists) {
    selectedDynasty.value = dynasty
  }
}

function renderChart() {
  if (!chartRef.value) return
  if (!historyDataset.value.length) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', (params) => {
      if (params.componentType === 'series') {
        selectDynasty(params.data?.dynasty || params.name || params.axisValue)
      }
    })
  }

  chartInstance.setOption({
    backgroundColor: 'transparent',
    animationDuration: 900,
    textStyle: {
      fontFamily: chartFont,
    },
    color: spiceNames.map((name) => palette[name]),
    grid: {
      left: 28,
      right: 28,
      top: 58,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(43, 30, 25, 0.92)',
      borderColor: 'rgba(214, 182, 145, 0.3)',
      textStyle: {
        color: '#f8f1e7',
      },
      extraCssText: 'box-shadow: 0 18px 40px rgba(44, 27, 18, 0.22); border-radius: 14px;',
      confine: true,
      formatter(params) {
        if (Array.isArray(params)) {
          const title = params[0]?.axisValue || ''
          const rows = params
            .map(
              (item) =>
                `<div style="display:flex;justify-content:space-between;gap:18px;margin-top:6px;">
                  <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color};margin-right:8px;"></span>${item.seriesName}</span>
                  <strong>${item.value}</strong>
                </div>`,
            )
            .join('')
          return `<div style="min-width:200px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:8px;">${title}</div>
            ${rows}
          </div>`
        }
        return ''
      },
    },
    legend: {
      top: 12,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#6e5a49',
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyDataset.value.map((row) => row.dynasty),
      axisLine: {
        lineStyle: {
          color: 'rgba(140, 102, 66, 0.35)',
        },
      },
      axisLabel: {
        color: '#6e5a49',
      },
    },
    yAxis: {
      type: 'value',
      name: '热度指数',
      nameTextStyle: {
        color: '#8c6a4b',
        padding: [0, 0, 8, 0],
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(150, 117, 87, 0.12)',
        },
      },
      axisLabel: {
        color: '#6e5a49',
      },
    },
    series: [
      ...spiceNames.map((name) => ({
        name,
        type: 'line',
        smooth: true,
        stack: 'total',
        cursor: 'pointer',
        triggerLineEvent: true,
        symbol: 'circle',
        symbolSize: 8,
        emphasis: { focus: 'series' },
        areaStyle: {
          opacity: 0.88,
        },
        lineStyle: {
          width: 2,
        },
        markLine:
          name === spiceNames[0]
            ? {
                silent: true,
                symbol: 'none',
                label: {
                  show: true,
                  formatter: '当前',
                  color: '#9b3f2e',
                  fontSize: 12,
                  fontWeight: 700,
                },
                lineStyle: {
                  color: 'rgba(181, 51, 42, 0.72)',
                  width: 1.5,
                  type: 'dashed',
                },
                data: [{ xAxis: selectedDynasty.value }],
              }
            : undefined,
        data: historyDataset.value.map((row) => row[name]),
      })),
    ],
  })
}

function handleResize() {
  chartInstance?.resize()
}

watch(selectedDynasty, () => {
  renderChart()
})

onMounted(async () => {
  await loadTimeData()
  renderChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
/* 完全保留原样式，仅移除 .back-button 相关（从未使用也无影响） */
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
    linear-gradient(90deg, rgba(255, 249, 240, 0.92) 0%, rgba(255, 249, 240, 0.74) 50%, rgba(255, 249, 240, 0.18) 100%),
    linear-gradient(135deg, rgba(123, 75, 42, 0.12), rgba(255, 249, 240, 0.08));
}

.hero-copy::before {
  content: '';
  position: absolute;
  inset: -18px;
  background-image: var(--hero-image);
  background-size: cover;
  background-position: center right;
  opacity: 0.42;
  filter: blur(2px) saturate(0.92) contrast(1);
  transform: scale(1.025);
}

.hero-copy::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 28%, rgba(212, 165, 101, 0.16), transparent 30%),
    linear-gradient(90deg, rgba(255, 249, 240, 0.96), rgba(255, 249, 240, 0.68) 50%, rgba(255, 249, 240, 0.2));
}

.hero-copy > * {
  position: relative;
  z-index: 1;
}

.hero-main {
  align-self: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  padding: 4px 9px 4px 6px;
  border: 1px solid rgba(157, 107, 69, 0.2);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(139, 91, 56, 0.14), rgba(255, 249, 240, 0.5));
  color: #805335;
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
    linear-gradient(135deg, #8b5b38, #d4a565);
  box-shadow: 0 4px 10px rgba(139, 91, 56, 0.18);
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
  max-width: 780px;
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
  background: linear-gradient(90deg, transparent, rgba(139, 91, 56, 0.32), transparent);
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

.chart-panel,
.side-panel {
  min-width: 0;
}

.chart-panel {
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

.panel-badge {
  white-space: nowrap;
  align-self: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(139, 91, 56, 0.1);
  color: #8b5b38;
  font-size: 12px;
}

.chart-shell {
  height: 410px;
  flex: 1;
  min-height: 410px;
}

.dynasty-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.dynasty-tab {
  border: 1px solid rgba(145, 105, 69, 0.18);
  background: rgba(255, 255, 255, 0.66);
  color: #6d513d;
  border-radius: 16px;
  padding: 10px 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.dynasty-tab.active {
  background: linear-gradient(135deg, #8b5b38, #ad7c50);
  color: #fff8f2;
  box-shadow: 0 10px 22px rgba(139, 91, 56, 0.24);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
}

.highlight-card,
.event-card {
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.94), rgba(245, 234, 220, 0.94));
  border: 1px solid rgba(150, 116, 83, 0.12);
}

.event-card {
  height: 210px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 91, 56, 0.28) transparent;
}

.event-card::-webkit-scrollbar {
  width: 6px;
}

.event-card::-webkit-scrollbar-track {
  background: transparent;
}

.event-card::-webkit-scrollbar-thumb {
  background: rgba(139, 91, 56, 0.26);
  border-radius: 999px;
}

.highlight-label,
.event-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #9f6e49;
  text-transform: uppercase;
}

.highlight-card h2,
.event-card h3 {
  margin: 0 0 10px;
  color: #4f2f1c;
}

.highlight-text,
.event-card p {
  margin: 0;
  line-height: 1.66;
  color: #6f5846;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.event-impact {
  margin-top: 10px !important;
  color: #935027 !important;
  max-width: 100%;
}

.spice-list {
  display: grid;
  gap: 10px;
}

.spice-row {
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr) 42px;
  gap: 12px;
  align-items: center;
}

.spice-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5f4736;
}

.spice-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spice-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(132, 95, 61, 0.08);
  overflow: hidden;
}

.spice-bar-fill {
  height: 100%;
  border-radius: inherit;
}

.spice-row strong {
  text-align: right;
  color: #5c3922;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    grid-template-columns: 1fr;
  }

  .hero-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .chart-shell {
    height: 390px;
    min-height: 390px;
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

  .dynasty-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .spice-row {
    grid-template-columns: 1fr;
  }

  .spice-row strong {
    text-align: left;
  }
}
</style>
