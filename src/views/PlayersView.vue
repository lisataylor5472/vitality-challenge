<template lang="pug">
  .players-dashboard
    .players-view-header(v-if="selectedPlayer == null")
      .view-options-wrapper
        .month-controls(v-if="!showPlayerDetails")
          button(@click="prevMonth", v-if="currentAdventureMonth != 'apr'")
            .month-title <
          .month-title {{ currentMonthName[currentAdventureMonth] }}
          button(@click="nextMonth", v-if="currentAdventureMonth != 'sep'")
            .month-title >
        .details-wrapper
          .title view character:
          .view-options
            button(@click="showPlayerDetails = true", :class="{ active: showPlayerDetails }") details
            button(@click="showPlayerDetails = false", :class="{ active: !showPlayerDetails }") activity
        .details-wrapper
          .title filter:
          .view-options
            button(@click="toggleCharacterType('all')", :class="{ active: showAllCharacters }") all
            button(@click="toggleCharacterType('light')", :class="{ active: showLightOnly }") light
            button(@click="toggleCharacterType('shadow')", :class="{ active: showShadowOnly }") shadow

    .loading-text(v-if="isLoading")
      h1 Loading...
    .table-wrapper(v-if="!isLoading && selectedPlayer == null")
      table(v-if="showPlayerDetails")
        thead
          tr.players-header-wrapper
            th(v-for="(header, index) in playerColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
        tbody.scrollable-table(v-if="showPlayerDetails")
          tr.player-wrapper(v-for="(player, playerIndex) in players" :key="playerIndex", @click="selectedPlayer = player")
            td(v-for="(header, index) in playerColumns" :class="`col-${header.key}`" :key="index")
              template(v-if="header.key === 'xp'")
                .player-xp-bar
                  .player-xp(:style="{ width: player.xpBar + '%' }", v-tooltip="`${Math.round(player.xpBar)}% towards next level`")
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
      table(v-if="!showPlayerDetails")
        thead
          tr.players-header-wrapper
            th(v-for="(header, index) in progressColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
        tbody.scrollable-table
          tr.player-wrapper(v-for="(player, playerIndex) in players" :key="playerIndex", @click="selectedPlayer = player")
            td(v-for="(header, index) in progressColumns" :class="`col-${header.key}`" :key="index")
              template(v-if="header.key === 'avatar'")
                img(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
                img(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
              template(v-else-if="header.key === 'successRate'")
                | {{ player?.successRates[currentAdventureMonth] }}%
              template(v-else-if="header.key === 'goalPerWeek'")
                | {{ player?.goalPerWeekByMonth[currentAdventureMonth] > 0 ? player?.goalPerWeekByMonth[currentAdventureMonth] : '-'}}
              template(v-else-if="header.key === 'activity'")
                linearTracker(:activityData="player.activity", :currentMonthRange="currentMonthRange")
              template(v-else)
                | {{ player[header.key] }}

    .player-view-wrapper(v-if="selectedPlayer != null")
      .char-header-wrapper
        button.back-button(@click="selectedPlayer = null", v-tooltip="`Back to players`")
          h1 <
        h1(v-if="selectedPlayer != null") {{ selectedPlayer.charName }}
      CharacterSheet(:player="selectedPlayer")

</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { useAppStore } from '@/store/app'
import CharacterSheet from '@/components/characterSheet.vue'
import LinearTracker from '@/components/linearTracker.vue'
import moment from 'moment'

export default defineComponent({
  name: 'PlayersView',
  components: {
    CharacterSheet,
    LinearTracker,
  },

  setup() {
    const appStore = useAppStore()

    const showPlayerDetails = ref(true)
    const showAllCharacters = ref(true)
    const showShadowOnly = ref(false)
    const showLightOnly = ref(false)

    const players = computed(() => {
      return appStore.playerTracker.filter((player) => {
        if (showAllCharacters.value) {
          return true
        } else if (showShadowOnly.value) {
          return player.isShadow
        } else if (showLightOnly.value) {
          return !player.isShadow
        }
        return false
      })
    })

    const isLoading = computed(() => appStore.isLoading)

    const selectedPlayer = ref(null)

    const toggleCharacterType = (type: string) => {
      if (type === 'all') {
        showAllCharacters.value = true
        showShadowOnly.value = false
        showLightOnly.value = false
      } else if (type === 'light') {
        showAllCharacters.value = false
        showShadowOnly.value = false
        showLightOnly.value = true
      } else if (type === 'shadow') {
        showAllCharacters.value = false
        showShadowOnly.value = true
        showLightOnly.value = false
      }
    }

    const playerColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      { name: 'class', key: 'class' },
      { name: 'hp', key: 'hp' },
      { name: 'total xp', key: 'totalXp' },
      { name: 'lvl', key: 'level' },
      { name: 'lvl progress', key: 'xp' },
      { name: 'achievements', key: 'achievements' },
    ])

    const progressColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      { name: 'success rate', key: 'successRate' },
      { name: 'goal per week', key: 'goalPerWeek' },
      { name: 'activity', key: 'activity' },
    ])

    const adventureMonthMap = {
      apr: [moment.utc('2025-04-06'), moment.utc('2025-05-03')],
      may: [moment.utc('2025-05-04'), moment.utc('2025-05-31')],
      jun: [moment.utc('2025-06-01'), moment.utc('2025-06-28')],
      jul: [moment.utc('2025-06-29'), moment.utc('2025-08-02')],
      aug: [moment.utc('2025-08-03'), moment.utc('2025-08-30')],
      sep: [moment.utc('2025-08-31'), moment.utc('2025-09-27')],
    } as any

    const currentMonthName = {
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
    }

    const currentDate = ref(moment.utc())

    const currentAdventureMonth = computed(() => {
      const monthKey = months[currentMonthIndex.value]
      return monthKey
    })

    const currentMonthIndex = ref(0)

    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep']

    const currentMonthRange = computed(() => {
      const monthKey = months[currentMonthIndex.value]
      return adventureMonthMap[monthKey]
    })

    watch(
      currentDate,
      (val) => {
        console.log('currentDate change', currentDate)
        const monthIndex = months.findIndex((key) => {
          console.log('watch current date months key', key)
          const [start, end] = adventureMonthMap[key]
          return currentDate.value.isSameOrAfter(start) && currentDate.value.isSameOrBefore(end)
        })
        console.log('monthIndex', monthIndex)
        currentMonthIndex.value = monthIndex
      },
      { immediate: true },
    )

    const prevMonth = () => {
      currentMonthIndex.value -= 1
    }

    const nextMonth = () => {
      currentMonthIndex.value += 1
    }

    return {
      players,
      playerColumns,
      progressColumns,
      isLoading,
      selectedPlayer,
      showPlayerDetails,
      toggleCharacterType,
      showAllCharacters,
      showLightOnly,
      showShadowOnly,
      prevMonth,
      nextMonth,
      currentAdventureMonth,
      currentMonthName,
      currentMonthRange,
      currentDate,
      months,
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
    height: 9rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .month-controls {
    border-radius: 20px;
    display: flex;
    align-items: center;
    button {
      background-color: var(--theme-col-parchment-lights);
      border: none;
      color: var(--theme-col-blurple);
      font-size: 1.5rem;
      cursor: pointer;
      margin: 0 1rem;
    }
  }
  .month-title {
    font-family: 'Pixelify Sans', sans-serif;
    font-size: 1.5rem;
    color: var(--theme-col-blurple);
  }
  .view-options-wrapper {
    background-color: var(--theme-col-parchment-light);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 3rem;
    // margin-top: 1rem;
    // margin-bottom: 1rem;
    width: 100%;
    .details-wrapper {
      // display: flex;
      // width: 50%;
      display: flex;
      align-items: center;
      .title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        color: var(--theme-col-blurple);
        font-size: 1rem;
        margin-right: 1rem;
        margin-left: 1rem;
      }
    }
    .view-options {
      button {
        border: 2px solid var(--theme-col-blurple);
        width: 85px;
        height: 25px;
        font-size: 0.9rem;
        font-family: 'Space Grotesk', serif;
        // display: flex;
        // justify-content: center;
        // margin-left: 1rem;
        // align-items: center;
        padding-bottom: 4px;
        cursor: pointer;
        transition:
          transform 0.1s ease,
          box-shadow 0.1s ease;
        &:not(.active) {
          background: #d0d6ff;
          color: var(--theme-col-blurple);
          box-shadow: 1px 1px 0px 1px var(--theme-col-blurple);
        }
        &.active {
          background: var(--theme-col-blurple);
          color: #fff;
          box-shadow: 1px 1px 0px 1px var(--theme-col-blurple);
        }

        &:first-of-type {
          border-radius: 37px 0 0 37px;
          &:only-of-type {
            border-radius: 37px 37px 37px 37px;
          }
        }

        &:last-of-type {
          border-radius: 0 37px 37px 0;
          &:only-of-type {
            border-radius: 37px 37px 37px 37px;
          }
        }
      }
    }
  }
  .char-header-wrapper {
    display: flex;
    margin-top: 4em;
    margin-bottom: 2em;
    .back-button {
      font-size: 1.5rem;
      color: var(--theme-col-blurple);
      cursor: pointer;
      border-radius: 20px;
      border: none;
      background-color: var(--theme-col-parchment);
      margin-right: 1em;
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
      max-height: 58vh; /* Adjust height */
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
          }
          &.col-level {
            font-weight: 500;
          }
          &.col-success {
            font-weight: 500;
          }
        }
      }
    }
  }
  .player-view-wrapper {
    // display: flex;
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
  // BOTH TABLES //
  .col-avatar {
    width: 4%;
    padding: 0;
    img {
      height: 30px;
      &.shadow {
        filter: grayscale(10);
      }
    }
  }
  .col-charName {
    width: 23%;
  }
  // Table 1 //
  .col-class {
    width: 10%;
  }
  .col-hp {
    width: 8%;
  }
  .col-totalXp {
    width: 8%;
  }
  .col-level {
    width: 8%;
  }
  .col-xp {
    width: 20%;
  }
  .col-achievements {
    width: 20%;
  }
  // Table 2 //
  .col-successRate {
    width: 8%;
  }
  .col-goalPerWeek {
    width: 8%;
  }
  .col-activity {
    width: 50%;
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
