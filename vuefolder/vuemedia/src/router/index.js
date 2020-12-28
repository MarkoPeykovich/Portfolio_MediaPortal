import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Vesti from '../views/Vesti.vue'
import IzabranaRubrika from '../views/IzabranaRubrika.vue'
import AdminPanel from '../views/AdminPanel.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/vesti',
    name: 'Vesti',
    component: Vesti
  },
  {
    path: '/IzabranaRubrika',
    name: 'IzabranaRubrika',
    component: IzabranaRubrika
  },
  {
    path: '/AdminPanel',
    name: 'Admin Panel',
    component: AdminPanel
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
