import { createRouter, createWebHistory } from 'vue-router'
// import GuideView from '../views/GuideView.vue'
import PlayersView from '../views/PlayersView.vue'
import CampaignView from '../views/CampaignView.vue'
import MapView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PlayersView,
    },
    // {
    //   path: '/players',
    //   name: 'players',
    //   component: PlayersView,
    // },
    {
      path: '/campaign',
      name: 'campaign',
      component: CampaignView,
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
    },
  ],
})

export default router
