<template>
  <div class="view-page">
    <section class="hero">
      <div class="hero-copy" :style="{ '--hero-image': `url(${silkRoadImage})` }">
        <div class="hero-main">
          <!-- 删除返回首页按钮 -->
          <p class="eyebrow">流向追踪 · 香料流转</p>
          <h1>从产地到用途的流动链路</h1>
          <p class="hero-text">
            以产地、贸易路线与最终用途组织桑基图，呈现传统香料跨地域流动的路径与归宿。
            点击节点或条带，即可查看对应链路的流量、方向与场景说明。
          </p>
        </div>
        <div class="hero-cards">
          <div class="metric-card">
            <span>当前香料</span>
            <strong>{{ activeSpice.name }}</strong>
          </div>
          <div class="metric-card">
            <span>总流量指数</span>
            <strong>{{ totalFlow }}</strong>
          </div>
          <div class="metric-card">
            <span>主路径</span>
            <strong>{{ leadRoute }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel chart-panel">
        <div class="panel-head">
          <div>
            <p class="panel-title">香料流转桑基图</p>
            <p class="panel-subtitle">前半段按香料区分颜色，汇入同一用途的条带使用统一用途色。</p>
          </div>
          <div class="panel-badge">ECharts Sankey</div>
        </div>

        <div class="legend-groups" aria-label="桑基图颜色图例">
          <div class="legend-row">
            <span class="legend-title">香料</span>
            <span
              v-for="spice in spiceCatalog"
              :key="spice.id"
              class="chip"
              :style="{ '--chip-color': spice.color }"
            >
              {{ spice.name }}
            </span>
          </div>
          <div class="legend-row">
            <span class="legend-title">用途</span>
            <span
              v-for="use in useLegend"
              :key="use.name"
              class="chip"
              :style="{ '--chip-color': use.color }"
            >
              {{ use.name }}
            </span>
          </div>
        </div>

        <div ref="chartRef" class="chart-shell"></div>
      </article>

      <aside class="panel side-panel">
        <div class="panel-head compact">
          <div>
            <p class="panel-title">链路说明</p>
            <p class="panel-subtitle flow-summary">{{ activeSpice.summary }}</p>
          </div>
        </div>

        <div class="highlight-card">
          <p class="highlight-label">{{ selectedDetail.typeLabel }}</p>
          <h2>{{ selectedDetail.title }}</h2>
          <p class="highlight-text">{{ selectedDetail.description }}</p>
        </div>

        <div class="fact-grid">
          <div class="fact-card">
            <span>产地层</span>
            <strong>{{ activeSpice.sources.length }} 个</strong>
          </div>
          <div class="fact-card">
            <span>路线层</span>
            <strong>{{ activeSpice.routes.length }} 条</strong>
          </div>
          <div class="fact-card">
            <span>用途层</span>
            <strong>{{ activeSpice.uses.length }} 类</strong>
          </div>
          <div class="fact-card">
            <span>最高用途</span>
            <strong>{{ leadUse }}</strong>
          </div>
        </div>

        <div class="flow-list">
          <div class="flow-block">
            <p class="block-title">核心产地</p>
            <div class="tag-list">
              <span v-for="item in activeSpice.sources" :key="item" class="tag">{{ item }}</span>
            </div>
          </div>

          <div class="flow-block">
            <p class="block-title">主要路线</p>
            <div class="tag-list">
              <span v-for="item in activeSpice.routes" :key="item" class="tag">{{ item }}</span>
            </div>
          </div>

          <div class="flow-block">
            <p class="block-title">最终用途</p>
            <div class="tag-list">
              <span v-for="item in activeSpice.uses" :key="item" class="tag">{{ item }}</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import silkRoadImage from '../../assets/images/silk-road.png'
// 删除了 useRouter 和 goBack

const chartRef = ref(null)
const chartFont = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif"

const spiceCatalog = [
  { id: 'agarwood', name: '沉香', color: '#8c4f3d' },
  { id: 'sandalwood', name: '檀香', color: '#c17b32' },
  { id: 'ambergris', name: '龙涎香', color: '#367b8d' },
  { id: 'musk', name: '麝香', color: '#9a4052' },
  { id: 'clove', name: '丁香', color: '#765a9b' },
  { id: 'patchouli', name: '藿香', color: '#54845a' },
]

const routeColor = '#617c78'

const usePalette = {
  外交礼品: '#c49335',
  '熏香（宫廷）': '#a94f43',
  药用: '#47866b',
  '熏香（宗教）': '#785d9a',
  '熏香（民间）': '#9a7045',
  '饮食（调味/防腐）': '#d17336',
  牙科麻醉: '#4d7fa0',
  防腐剂: '#687d7c',
  化妆品原料: '#b65f7b',
}

function getUseColor(use) {
  return usePalette[use] || '#8f705f'
}

const flowDataset = ref({})

async function loadFlowData() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/flow-sankey.json`)
  const json = await res.json()
  flowDataset.value = json.data
}

const activeSpice = computed(() => buildCombinedFlow())

const useLegend = computed(() =>
  compactList(activeSpice.value.uses).map((use) => ({
    name: use,
    color: getUseColor(use),
  })),
)

const totalFlow = computed(() =>
  activeSpice.value.links
    .filter((item) => item.kind === 'spice-source')
    .reduce((sum, item) => sum + item.value, 0),
)

const routeScores = computed(() => {
  const scores = {}
  activeSpice.value.links.forEach((link) => {
    if (link.kind === 'route-use') {
      scores[link.sourceLabel] = (scores[link.sourceLabel] || 0) + link.value
    }
  })
  return scores
})

const useScores = computed(() => {
  const scores = {}
  activeSpice.value.links.forEach((link) => {
    if (link.kind === 'route-use') {
      scores[link.targetLabel] = (scores[link.targetLabel] || 0) + link.value
    }
  })
  return scores
})

const leadRoute = computed(() => {
  const sorted = Object.entries(routeScores.value).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || '-'
})

const leadUse = computed(() => {
  const sorted = Object.entries(useScores.value).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || '-'
})

const selectedDetail = ref({
  typeLabel: '默认链路',
  title: '请选择条带查看详情',
  description: '点击桑基图中的节点或条带，这里会展示对应流转说明。',
})

function compactList(items) {
  return [...new Set(items)].filter(Boolean)
}

function addAggregatedLink(map, link) {
  const key = `${link.source}=>${link.target}`
  if (!map.has(key)) {
    map.set(key, { ...link })
    return
  }
  const current = map.get(key)
  current.value += link.value
  if (link.spiceName && !current.spiceNames.includes(link.spiceName)) {
    current.spiceNames.push(link.spiceName)
  }
  current.description = `${current.sourceLabel} → ${current.targetLabel}，合计流量指数为 ${current.value}。`
}

function buildCombinedFlow() {
  const entries = spiceCatalog
    .map((spice) => ({ spice, detail: flowDataset.value[spice.id] }))
    .filter((item) => item.detail)

  if (!entries.length) {
    return { name: '加载中...', summary: '', sources: [], routes: [], uses: [], nodes: [], links: [] }
  }

  const nodes = []
  const links = []
  const routeUseLinks = new Map()
  const sources = []
  const routes = []
  const uses = []

  entries.forEach(({ spice, detail }) => {
    const sourceTotals = {}
    ;(detail.links || []).forEach((link) => {
      if ((detail.sources || []).includes(link.source)) {
        sourceTotals[link.source] = (sourceTotals[link.source] || 0) + link.value
      }
    })

    const spiceNode = `spice:${spice.id}`
    nodes.push({
      name: spiceNode,
      label: spice.name,
      depth: 0,
      kind: 'spice',
      itemStyle: {
        color: spice.color,
        borderColor: 'rgba(255, 250, 243, 0.96)',
        borderWidth: 1.5,
      },
    })

    ;(detail.sources || []).forEach((source) => {
      const sourceNode = `source:${spice.id}:${source}`
      const sourceLabel = `${spice.name} · ${source}`
      sources.push(sourceLabel)
      nodes.push({
        name: sourceNode,
        label: sourceLabel,
        depth: 1,
        kind: 'source',
        itemStyle: {
          color: spice.color,
          borderColor: 'rgba(255, 250, 243, 0.96)',
          borderWidth: 1.5,
        },
      })
      links.push({
        source: spiceNode,
        target: sourceNode,
        sourceLabel: spice.name,
        targetLabel: sourceLabel,
        spiceName: spice.name,
        spiceNames: [spice.name],
        kind: 'spice-source',
        value: sourceTotals[source] || 1,
        description: `${sourceLabel} 是 ${spice.name} 的源头产地或关键集散地。`,
        lineStyle: {
          color: spice.color,
          opacity: 0.52,
          curveness: 0.5,
        },
      })
    })

    ;(detail.routes || []).forEach((route) => routes.push(route))
    ;(detail.uses || []).forEach((use) => uses.push(use))

    ;(detail.links || []).forEach((link) => {
      if ((detail.sources || []).includes(link.source)) {
        const sourceNode = `source:${spice.id}:${link.source}`
        const routeNode = `route:${link.target}`
        links.push({
          ...link,
          source: sourceNode,
          target: routeNode,
          sourceLabel: `${spice.name} · ${link.source}`,
          targetLabel: link.target,
          spiceName: spice.name,
          spiceNames: [spice.name],
          kind: 'source-route',
          lineStyle: {
            color: spice.color,
            opacity: 0.48,
            curveness: 0.5,
          },
        })
        return
      }

      addAggregatedLink(routeUseLinks, {
        source: `route:${link.source}`,
        target: `use:${link.target}`,
        sourceLabel: link.source,
        targetLabel: link.target,
        spiceName: spice.name,
        spiceNames: [spice.name],
        kind: 'route-use',
        value: link.value,
        description: `${link.source} → ${link.target}，合计流量指数为 ${link.value}。`,
        lineStyle: {
          color: getUseColor(link.target),
          opacity: 0.5,
          curveness: 0.5,
        },
      })
    })
  })

  compactList(routes).forEach((route) => {
    nodes.push({
      name: `route:${route}`,
      label: route,
      depth: 2,
      kind: 'route',
      itemStyle: {
        color: routeColor,
        borderColor: 'rgba(255, 250, 243, 0.96)',
        borderWidth: 1.5,
      },
    })
  })

  compactList(uses).forEach((use) => {
    nodes.push({
      name: `use:${use}`,
      label: use,
      depth: 3,
      kind: 'use',
      itemStyle: {
        color: getUseColor(use),
        borderColor: 'rgba(255, 250, 243, 0.96)',
        borderWidth: 1.5,
      },
    })
  })

  return {
    name: '六大香料',
    summary: '六大香料总览：从产地出发，经由贸易路线汇入不同用途场景，呈现跨地域流动的整体结构。',
    sources: compactList(sources),
    routes: compactList(routes),
    uses: compactList(uses),
    nodes,
    links: [...links, ...routeUseLinks.values()],
  }
}

function buildNodeData() {
  return activeSpice.value.nodes
}

function defaultDetail() {
  if (!activeSpice.value.links.length) return
  const first = activeSpice.value.links[0]
  selectedDetail.value = {
    typeLabel: '代表性链路',
    title: `${first.sourceLabel || first.source} → ${first.targetLabel || first.target}`,
    description: first.description,
  }
}

let chartInstance = null
let chartResizeObserver = null
let resizeFrame = 0

function renderChart() {
  if (!chartRef.value) return
  if (!activeSpice.value.links.length) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true,
    })
    chartInstance.on('click', (params) => {
      if (params.dataType === 'edge') {
        selectedDetail.value = {
          typeLabel: '流转条带',
          title: `${params.data.sourceLabel || params.data.source} → ${params.data.targetLabel || params.data.target}`,
          description: params.data.description || `该链路的流量指数为 ${params.data.value}。`,
        }
        return
      }
      selectedDetail.value = {
        typeLabel:
          params.data.kind === 'spice'
            ? '香料节点'
            : params.data.kind === 'source'
              ? '产地节点'
              : params.data.kind === 'route'
                ? '路线节点'
                : '用途节点',
        title: params.data.label || params.data.name,
        description:
          params.data.kind === 'spice'
            ? '这里代表一种香料及其后续产地、路线与用途的整体流向。'
            : params.data.kind === 'source'
              ? '这里代表香料的源头产地或关键集散地。'
              : params.data.kind === 'route'
              ? '这里代表香料被组织、运输和扩散的关键贸易路径。'
              : '这里代表香料最终落入的文化与功能场景。',
      }
    })
  }

  chartInstance.setOption({
    backgroundColor: 'transparent',
    animationDuration: 900,
    textStyle: {
      fontFamily: chartFont,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(43, 30, 25, 0.92)',
      borderColor: 'rgba(214, 182, 145, 0.3)',
      textStyle: {
        color: '#f8f1e7',
      },
      confine: true,
      extraCssText: 'box-shadow: 0 18px 40px rgba(44, 27, 18, 0.22); border-radius: 14px; max-width:280px; white-space:normal; overflow-wrap:anywhere; word-break:break-word;',
      formatter(params) {
        if (params.dataType === 'edge') {
          return `<div style="width:250px;max-width:250px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">
            <div style="font-weight:700;margin-bottom:8px;line-height:1.45;white-space:normal;overflow-wrap:anywhere;">${params.data.sourceLabel || params.data.source} → ${params.data.targetLabel || params.data.target}</div>
            <div>流量指数：${params.data.value}</div>
            <div style="margin-top:8px;line-height:1.7;white-space:normal;overflow-wrap:anywhere;">${params.data.description}</div>
          </div>`
        }
        return `<div style="max-width:220px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">
          <div style="font-weight:700;margin-bottom:6px;line-height:1.45;">${params.data.label || params.name}</div>
          <div>${params.data.kind === 'spice' ? '香料层' : params.data.kind === 'source' ? '产地层' : params.data.kind === 'route' ? '路线层' : '用途层'}</div>
        </div>`
      },
    },
    series: [
      {
        type: 'sankey',
        left: 40,
        right: 160,
        top: 24,
        bottom: 24,
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            opacity: 0.82,
          },
          itemStyle: {
            shadowBlur: 7,
            shadowColor: 'rgba(74, 52, 37, 0.18)',
          },
          label: {
            color: '#493426',
            fontWeight: 650,
          },
        },
        blur: {
          lineStyle: {
            opacity: 0.16,
          },
          itemStyle: {
            opacity: 0.48,
          },
          label: {
            opacity: 0.52,
          },
        },
        nodeAlign: 'justify',
        draggable: false,
        nodeWidth: 18,
        nodeGap: 12,
        data: buildNodeData(),
        links: activeSpice.value.links.map((item) => ({
          ...item,
        })),
        label: {
          color: '#584233',
          fontSize: 12,
          fontWeight: 550,
          distance: 8,
          textBorderColor: 'rgba(255, 250, 243, 0.72)',
          textBorderWidth: 1,
          formatter: (params) => params.data.label || params.name,
        },
        lineStyle: {
          color: 'source',
          opacity: 0.48,
          curveness: 0.5,
        },
        itemStyle: {
          borderColor: 'rgba(255, 250, 243, 0.96)',
          borderWidth: 1.5,
          shadowBlur: 5,
          shadowColor: 'rgba(74, 52, 37, 0.16)',
        },
      },
    ],
  })
}

function handleResize() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    chartInstance?.resize()
  })
}

onMounted(async () => {
  await loadFlowData()
  defaultDetail()
  renderChart()
  if (chartRef.value) {
    chartResizeObserver = new ResizeObserver(handleResize)
    chartResizeObserver.observe(chartRef.value)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartResizeObserver?.disconnect()
  chartResizeObserver = null
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
/* 完全保留原样式，仅移除 .back-button 相关（保留样式不影响） */
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
    linear-gradient(135deg, rgba(186, 128, 58, 0.12), rgba(255, 249, 240, 0.08));
}

.hero-copy::before {
  content: '';
  position: absolute;
  inset: -18px;
  background-image: var(--hero-image);
  background-size: cover;
  background-position: center right;
  opacity: 0.46;
  filter: blur(2px) saturate(0.96) contrast(1);
  transform: scale(1.025);
}

.hero-copy::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 28%, rgba(212, 156, 71, 0.12), transparent 32%),
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
  /* 保留样式 */
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
  background: linear-gradient(90deg, rgba(186, 128, 58, 0.15), rgba(255, 249, 240, 0.5));
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
    linear-gradient(135deg, #b87a3b, #d4a565);
  box-shadow: 0 4px 10px rgba(186, 128, 58, 0.18);
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
  background: linear-gradient(90deg, transparent, rgba(186, 128, 58, 0.34), transparent);
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

.flow-summary {
  min-height: 3.16em;
  max-height: 3.16em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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

.legend-groups {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(139, 91, 56, 0.1);
  border-radius: 14px;
  background: rgba(255, 252, 247, 0.72);
}

.legend-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.legend-title {
  width: 34px;
  flex: 0 0 34px;
  color: #8a6b52;
  font-size: 12px;
  font-weight: 700;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid color-mix(in srgb, var(--chip-color) 42%, rgba(145, 105, 69, 0.14));
  background: color-mix(in srgb, var(--chip-color) 10%, white);
  color: #543b2a;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 650;
}

.chip::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chip-color) 16%, transparent);
}

.chart-shell {
  height: 600px;
  flex: 1;
  min-height: 600px;
  border: 1px solid rgba(139, 91, 56, 0.12);
  border-radius: 18px;
  background:
    linear-gradient(90deg, rgba(111, 74, 47, 0.035), transparent 28%, rgba(47, 127, 134, 0.035) 62%, rgba(194, 138, 56, 0.04)),
    rgba(255, 253, 249, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
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
  height: 154px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 91, 56, 0.28) transparent;
}

.highlight-card::-webkit-scrollbar {
  width: 6px;
}

.highlight-card::-webkit-scrollbar-track {
  background: transparent;
}

.highlight-card::-webkit-scrollbar-thumb {
  background: rgba(139, 91, 56, 0.26);
  border-radius: 999px;
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
  min-height: 2.5em;
  max-height: 2.5em;
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.highlight-text {
  margin: 0;
  line-height: 1.66;
  color: #6f5846;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.fact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.fact-card {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(145, 105, 69, 0.12);
}

.fact-card span {
  display: block;
  color: #8b6b50;
  font-size: 13px;
  margin-bottom: 8px;
}

.fact-card strong {
  color: #563521;
  font-size: 18px;
}

.flow-list {
  display: grid;
  gap: 10px;
}

.flow-block {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(145, 105, 69, 0.12);
}

.block-title {
  margin: 0 0 10px;
  color: #604432;
  font-weight: 700;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(244, 231, 214, 0.9);
  color: #6f5440;
  font-size: 13px;
}

@media (max-width: 1120px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    grid-template-columns: 1fr;
  }

  .hero-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .chart-shell {
    height: 390px;
    min-height: 390px;
  }

  .fact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
