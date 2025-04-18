<template lang="pug">
  .players-dashboard
    .players-view-header
      img(src="@/assets/PlayersText.svg" alt="Players")
      h1(v-if="selectedPlayer != null") {{ selectedPlayer.charName }}
    .loading-text(v-if="isLoading")
      h1 Loading...
    .table-wrapper(v-if="!isLoading && selectedPlayer == null")
      table
        thead
          tr.players-header-wrapper
            th(v-for="(header, index) in playerColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
        tbody.scrollable-table
          tr.player-wrapper(v-for="(player, playerIndex) in players" :key="playerIndex", @click="selectedPlayer = player")
            td(v-for="(header, index) in playerColumns" :class="`col-${header.key}`" :key="index")
              template(v-if="header.key === 'xp'")
                .player-xp-bar
                  .player-xp(:style="{ width: player.xpBar + '%' }", v-tooltip="`${Math.round(player.xpBar)}%`")
              template(v-else-if="header.key === 'adventure'")
                | {{ player.successRate }}%
              template(v-else-if="header.key === 'achievements'")
                template(v-if="player.achievements != '' ")
                  .achievements-wrapper
                    template(v-for="achievement in player.achievements")
                      img.achievement-icon(:src="`/achievements/${achievement.icon}.svg`", alt="Achievements", width="20px", height="20px", v-tooltip="`${achievement.title}`")
              template(v-else-if="header.key === 'level'")
                | {{ player.level }}
              template(v-else-if="header.key === 'avatar'")
                img(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
                img(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
              template(v-else-if="header.key === 'hp'")
                | {{ player[header.key] }}
              template(v-else)
                | {{ player[header.key] }}

    .player-view-wrapper(v-if="selectedPlayer != null")
      .button-wrapper(v-tooltip="`Back to players`")
        button.back-button(@click="selectedPlayer = null")
          h1 <
      CharacterSheet(:player="selectedPlayer")
        //- img(src="@/assets/close.svg", alt="Close", width="20px", height="20px")



</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useAppStore } from '@/store/app'
import CharacterSheet from '@/components/characterSheet.vue'

export default defineComponent({
  name: 'PlayersView',
  components: {
    CharacterSheet,
  },

  setup() {
    const appStore = useAppStore()
    const players = computed(() => appStore.playerTracker)
    // const activityData = computed(() => appStore.activityData)
    // const oathTracker = computed(() => appStore.oathTracker)
    const isLoading = computed(() => appStore.isLoading)

    const selectedPlayer = ref(null)

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
      selectedPlayer,
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
      height: 9rem;
    }
  }
  .button-wrapper {
    .back-button {
      font-size: 1.5rem;
      color: var(--theme-col-blurple);
      cursor: pointer;
      border-radius: 20px;
      border: none;
      background-color: var(--theme-col-parchment);
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
      font-size: 0.9rem;
      tr {
        display: table;
        width: 100%;
        table-layout: auto;
        background-color: var(--theme-col-parchment-light);
        border-bottom: 4px solid var(--theme-col-parchment);
        // .player-wrapper {
        //   cursor: pointer;
        //   &:hover {
        //     box-shadow: inset 0px 0px 0px 1px var(--theme-col-dark-red);
        //   }
        // }
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
  .player-view-wrapper {
    display: flex;
    // height: 100%;
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
      height: 30px;
      &.shadow {
        filter: grayscale(10);
      }
    }
  }
  .col-charName {
    width: 20%;
  }
  .col-level {
    width: 8%;
  }
  .col-class {
    width: 10%;
  }
  .col-xp {
    width: 20%;
  }
  .col-achievements {
    width: 20%;
  }
  .col-adventure {
    width: 10%;
  }
  .achievements-wrapper {
    .achievement-icon {
      width: 20px;
      height: 20px;
      margin-right: 0.5em;
    }
    img {
      filter: brightness(0) saturate(100%) invert(18%) sepia(22%) saturate(746%) hue-rotate(10deg)
        brightness(92%) contrast(89%);
    }
  }
  .player-wrapper {
    cursor: pointer;
    &:hover {
      color: var(--theme-col-blurple);
    }
  }
}
</style>
