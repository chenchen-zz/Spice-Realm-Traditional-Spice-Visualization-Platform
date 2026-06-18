import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MainView,
  },
  // 其他旧路由重定向到首页，保证原有链接可用
  {
    path: '/time',
    redirect: '/',
  },
  {
    path: '/space',
    redirect: '/',
  },
  {
    path: '/flow',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
