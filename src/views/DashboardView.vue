<template lang="pug">
  .players-overview
    .players-table-header
      h1 Players
    .players-table-content-wrapper
      .player-wrapper(v-for="player in players")
        span {{ player.name }}
        span {{ player.class }}



</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from '@/store/app'
import { computed } from 'vue'

export default defineComponent({
  name: 'DashboardView',
  components: {},

  setup() {
    const appStore = useAppStore()
    const players = computed(() => appStore.playerList)

    return {
      players,
    }
  },
})
</script>

<style lang="scss" scoped>
.players-overview {
  background-color: var(--theme-col-parchment);
  padding: 1rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .players-table-header {
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      font-family: 'Grenze Gotisch', serif;
    }
  }
  .players-table-content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    .player-wrapper {
      background-color: var(--theme-col-parchment-light);
      padding: 1rem;
    }
  }
}
</style>
