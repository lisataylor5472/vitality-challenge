<template lang="pug">
  .players-dashboard
    .players-view-header
      img(src="@/assets/PlayersText.svg" alt="Players")
    .loading-text(v-if="isLoading")
      h1 Loading...
    .table-wrapper(v-if="!isLoading")
      table
        thead
          tr.players-header-wrapper
            th(v-for="(header, index) in playerColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
        tbody.scrollable-table
          tr.player-wrapper(v-for="(player, playerIndex) in players" :key="playerIndex")
            td(v-for="(header, index) in playerColumns" :class="`col-${header.key}`" :key="index")
              template(v-if="header.key === 'xp'")
                .player-xp-bar
                  .player-xp(:style="{ width: player.xpBar + '%' }")
              template(v-else-if="header.key === 'adventure'")
                | {{ player.successRate }}%
              template(v-else-if="header.key === 'achievements'")
                template(v-if="player.achievements != '' ")
                  .achievements-wrapper
                    img(:src="`/achievements/${player.achievements}.svg`", alt="Achievements", width="20px", height="20px", title="First Sound Off Complete")
              template(v-else-if="header.key === 'level'")
                | {{ player.level }}
              template(v-else-if="header.key === 'avatar'")
                img(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
                img(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
              template(v-else-if="header.key === 'hp'")
                | {{ player[header.key] }}
              template(v-else)
                | {{ player[header.key] }}

</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useAppStore } from '@/store/app'
// import moment from 'moment'

export default defineComponent({
  name: 'PlayersView',
  components: {},

  setup() {
    const appStore = useAppStore()
    const players = computed(() => appStore.playerTracker)
    // const activityData = computed(() => appStore.activityData)
    // const oathTracker = computed(() => appStore.oathTracker)
    const isLoading = computed(() => appStore.isLoading)

    const playerColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      { name: 'level', key: 'level' },
      { name: 'class', key: 'class' },
      { name: 'hp', key: 'hp' },
      { name: 'adventure', key: 'adventure' },
      { name: 'xp', key: 'xp' },
      { name: 'achievements', key: 'achievements' },
    ])

    return {
      players,
      playerColumns,
      isLoading,
    }
  },
})
</script>

<style lang="scss" scoped>
.players-dashboard {
  padding: 0 4.8rem 2.5rem 2.5rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .loading-text {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 4rem;
    color: var(--theme-col-blurple);
  }
  .players-view-header {
    img {
      height: 9rem;
    }
  }
  table {
    border-collapse: collapse;
    width: 100%;
    height: 100%;
    margin-top: -2em;
    thead {
      color: var(--theme-col-dark-red);
      font-family: 'Grenze Gotisch', serif;
      font-size: 1.2rem;
      display: table;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 2;

      // background-color: var(--theme-col-parchment);
      th {
        padding-right: 10px;
        border-bottom: 2px solid var(--theme-col-dark-red);
      }
    }
    .scrollable-table {
      display: block;
      max-height: 48vh; /* Adjust height */
      overflow-y: overlay;
      width: 100%;
      font-family: 'Space Grotesk', sans-serif;
      tr {
        display: table;
        width: 100%;
        table-layout: auto;
        background-color: var(--theme-col-parchment-light);
        border-bottom: 4px solid var(--theme-col-parchment);
        td {
          padding: 0.2rem 0.4em;
          text-align: center;
          overflow: hidden;
          &.col-charName {
            font-weight: 600;
            color: var(--theme-col-blurple);
          }
          &.col-hp {
            font-weight: 600;
            // color: var(--theme-col-blurple);
          }
          &.col-level {
            font-weight: 500;
          }
          &.col-adventure {
            font-weight: 500;
          }
        }
      }
    }
  }
  .player-xp-bar {
    background-color: var(--theme-col-parchment-dark);
    height: 1em;
    width: 100%;
    border-radius: 0.5em;
    margin-top: 0.5em;
    box-shadow: inset 3px 3px 0em 1px var(--theme-col-brown-light);
    .player-xp {
      background-color: var(--theme-col-green);
      height: 100%;
      width: 0%;
      border-radius: 0.5em;
      box-shadow: inset -2px -2px 0em 1px var(--theme-col-ml-green);
    }
  }
  .col-avatar {
    width: 5%;
    padding: 0;
    img {
      height: 40px;
      &.shadow {
        filter: grayscale(10);
      }
    }
  }
  .col-charName {
    width: 12%;
  }
  .col-level {
    width: 8%;
  }
  .col-class {
    width: 10%;
  }
  .col-xp {
    width: 25%;
  }
  .col-achievements {
    width: 20%;
  }
  .col-adventure {
    width: 10%;
  }
  .achievements-wrapper {
    img {
      filter: brightness(0) saturate(100%) invert(18%) sepia(22%) saturate(746%) hue-rotate(10deg)
        brightness(92%) contrast(89%);
    }
  }
}
</style>
