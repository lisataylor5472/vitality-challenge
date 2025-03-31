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
              template(v-else-if="header.key === 'progress'")
                | {{ player.successRate }}%
              template(v-else-if="header.key === 'achievements'")
                | {{ player[header.key] }}
              template(v-else-if="header.key === 'level'")
                | {{ player.level }}
              template(v-else-if="header.key === 'avatar'")
                img(v-if="player", :src="`/avatars/${player.playerPng}`", alt="Player Avatar")
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
    const players = computed(() => appStore.playerTracker)
    const activityData = computed(() => appStore.activityData)
    const oathTracker = computed(() => appStore.oathTracker)
    const isLoading = computed(() => appStore.isLoading)

    const playerColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      { name: 'class', key: 'class' },
      { name: 'level', key: 'level' },
      { name: 'xp', key: 'xp' },
      { name: 'progress', key: 'progress' },
      { name: 'achievements', key: 'achievements' },
    ])

    const computePlayerStats = (player: any) => {
      const goalPerWeek = findGoalPerWeek(player.playerId)

      // Filter activity data for the current player
      const playerActivity = activityData.value
        .filter((activity: any) => activity.playerId === player.playerId)
        .map((activity: any) => activity.date)
      if (player.playerId == 'U03EBQ5M40M') {
        console.log('playerActivity', playerActivity)
      }

      const monthlyCounts = {}

      for (let week = 1; week <= 52; week++) {
        const weekKey = `W${week}`
        const date = moment().month(0).startOf('month').week(week)
        const monthKey = date.format('MM')
        monthlyCounts[monthKey] = monthlyCounts[monthKey] || {}
        monthlyCounts[monthKey][weekKey] = { count: 0, successRate: 0 }
      }

      // Calculate weekly and monthly counts
      playerActivity.forEach((date) => {
        const startOfWeekDate = moment(date).startOf('week') // Find the first day of the given date's week
        const endOfWeekDate = moment(date).endOf('week') // Find the last day of the given date's week
        const weekForDay =
          startOfWeekDate.month() < endOfWeekDate.month() ? startOfWeekDate : endOfWeekDate

        const week = weekForDay.week()
        const weekKey = `W${week}`
        const monthKey = Object.keys(monthlyCounts).find((month) =>
          Object.keys(monthlyCounts[month]).includes(weekKey),
        )
        monthlyCounts[monthKey][weekKey].count += 1
        monthlyCounts[monthKey][weekKey].successRate = Math.min(
          1,
          monthlyCounts[monthKey][weekKey].count / goalPerWeek,
        )
      })
      // Calculate total XP and level based on weekly counts
      const { totalXp, playerLevel, levelPercent, successRate } = findPlayerXp(
        goalPerWeek,
        monthlyCounts,
      )

      // Calculate success rate based on monthly counts
      // const monthlySuccessRate = findPlayerSuccessRate(goalPerWeek, monthlyCounts)
      player.totalXp = totalXp
      player.xpBar = levelPercent
      player.level = playerLevel
      player.successRate = successRate
    }

    const levelThresholds = {
      1: [0, 100],
      2: [100, 225],
      3: [225, 375],
      4: [375, 550],
      5: [550, 750],
      6: [750, 1000],
      7: [1000, 1300],
    }

    const findGoalPerWeek = (playerId: string) => {
      // TODO - update to handle changing oaths/goalPerWeek .. yikes
      const playerOath = oathTracker.value.find((oath) => oath.playerId == playerId)
      return playerOath ? playerOath.xPerWeek : 0
    }

    const findPlayerXp = (goalPerWeek: int, monthlyCounts: any) => {
      let totalXp = 0
      let playerLevel = 1
      let levelPercent = 0
      const monthlySuccessRates = []

      const currentMonth = moment().format('MM')
      const currentWeek = moment().isoWeek()
      let currentAdventureProgress = 0

      // Calculate current adventure progress
      if (monthlyCounts[currentMonth]) {
        const weekKeys = Object.keys(monthlyCounts[currentMonth])
        const currentWeekIndex = weekKeys.indexOf(`W${currentWeek}`) + 1

        currentAdventureProgress = currentWeekIndex / weekKeys.length
      }

      const weeks = monthlyCounts[currentMonth]
      const weeklyRates = Object.entries(weeks).map(([week, { successRate }]) => successRate)

      Object.entries(monthlyCounts).forEach(([_, weeks]) => {
        Object.entries(weeks).forEach(([week, { count }]) => {
          if (count > goalPerWeek && goalPerWeek > 0) {
            totalXp += 38.5
          } else if (count == goalPerWeek) {
            totalXp += 35
          } else if (count < goalPerWeek && count > 0) {
            totalXp += (count / goalPerWeek) * 35
          } else {
            totalXp += 0
          }
        })
      })

      // Calculate player success rate
      const totalSuccessRate = weeklyRates.reduce((sum, rate) => sum + rate, 0) / weeklyRates.length
      const successRate = Math.round(totalSuccessRate * currentAdventureProgress * 100)

      // Find level XP based on total XP
      Object.entries(levelThresholds).forEach(([level, thresholds]) => {
        const [minXp, maxXp] = thresholds
        if (totalXp >= minXp && totalXp < maxXp) {
          playerLevel = parseInt(level)
          levelPercent = ((totalXp - minXp) / (maxXp - minXp)) * 100
          console.log('levelPercent', levelPercent)
        }
      })
      return { totalXp, playerLevel, levelPercent, successRate }
    }

    watch(
      players,
      (newVal) => {
        newVal.forEach((player) => {
          computePlayerStats(player)
        })
      },
      { immediate: true },
    )

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
    width: 12%;
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
  .col-progress {
    width: 10%;
  }
}
</style>
