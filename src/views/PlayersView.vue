<template lang="pug">
  .players-dashboard
    .players-view-header
      img(src="@/assets/PlayersText.svg" alt="Players")
    .table-wrapper
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
              template(v-else-if="header.key === 'achievements'")
                | {{ player[header.key] }}
              template(v-else-if="header.key === 'level'")
                | {{ player.level }}
              template(v-else)
                | {{ player[header.key] }}

</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { useAppStore } from '@/store/app'
import moment from 'moment'

export default defineComponent({
  name: 'PlayersView',
  components: {},

  setup() {
    const appStore = useAppStore()
    const players = computed(() => appStore.playerList)
    const activityData = computed(() => appStore.activityData)

    const playerColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'name' },
      { name: 'class', key: 'class' },
      { name: 'level', key: 'level' },
      { name: 'xp', key: 'xp' },
      { name: 'achievements', key: 'achievements' },
    ])
    const computePlayerXp = (player: any) => {
      const goalPerWeek = player.goalPerWeek
      const daysInMonth = moment().daysInMonth()
      const xpIncrement = 100 / ((daysInMonth / 7) * goalPerWeek)
      let xp = 0
      console.log(player.name)
      console.log('xpIncrement', xpIncrement)
      console.log('goalPerWeek', goalPerWeek)
      const weeklyCounts = {
        '2025-02-23': { count: 0 },
        '2025-03-02': { count: 0 },
        '2025-03-09': { count: 0 },
        '2025-03-16': { count: 0 },
        '2025-03-23': { count: 0 },
        '2025-03-30': { count: 0 },
        '2025-04-06': { count: 0 },
        '2025-04-13': { count: 0 },
        '2025-04-20': { count: 0 },
        '2025-04-27': { count: 0 },
      }
      if (player.playerId) {
        const playerActivity = activityData.value.filter(
          (activity: any) => activity.playerId == player.playerId,
        )
        console.log('playerActivity', playerActivity)
        if (playerActivity) {
          const uniqueDays = [
            ...new Set(playerActivity.map((activity: any) => activity.date)),
          ].sort()
          console.log('uniqueDays', uniqueDays)
          uniqueDays.forEach((day: string) => {
            const mDay = moment(day)
            const week = mDay.startOf('week').format('YYYY-MM-DD')
            if (weeklyCounts[week]) {
              console.log('week', week, weeklyCounts[week].count)

              weeklyCounts[week].count += 1
              if (weeklyCounts[week].count >= goalPerWeek + 2) {
                return
              } else if (weeklyCounts[week].count > goalPerWeek) {
                console.log('half')
                xp += xpIncrement / 2
              } else {
                xp += xpIncrement
              }
            }
          })
        }
      }
      return xp
    }

    const levelThresholds = {
      1: 100,
      2: 250,
      3: 450,
      4: 700,
      5: 1000,
    }
    const findPlayerLevel = (totalXp) => {
      let level = 1
      for (const [key, threshold] of Object.entries(levelThresholds)) {
        if (totalXp >= threshold) {
          level += 1
        } else {
          break
        }
      }
      return level
    }

    const findPlayerXpProgress = (totalXp, level) => {
      const currentLevel = levelThresholds[level - 1]
      const xpNeeded = levelThresholds[level] - currentLevel
      const xpProgress = totalXp - currentLevel
      console.log('xpProgress', xpProgress)
      console.log('xpNeeded', xpNeeded)
      return (xpProgress / xpNeeded) * 100
    }

    watch(
      players,
      (newVal) => {
        newVal.forEach((player) => {
          player.totalXp = computePlayerXp(player)
          player.level = findPlayerLevel(player.totalXp)
          player.xpBar = findPlayerXpProgress(player.totalXp, player.level)
        })
      },
      { immediate: true },
    )

    return {
      players,
      playerColumns,
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
          padding: 0.5rem 0.4em;
          text-align: center;
          overflow: hidden;
          // &:first-child {
          //   border-top-left-radius: 10px;
          //   border-bottom-left-radius: 10px;
          // }
          // &:last-child {
          //   border-top-right-radius: 10px;
          //   border-bottom-right-radius: 10px;
          // }
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
  }
  .col-name {
    width: 15%;
  }
  .col-level {
    width: 10%;
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
}
</style>
