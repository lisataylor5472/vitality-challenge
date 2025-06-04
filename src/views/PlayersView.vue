<template lang="pug">
  .players-dashboard
    .players-view-header(v-if="selectedPlayer == null")
      .view-options-wrapper
        .deep-lore-button
          button(@click="toggleView") {{ buttonText }}
        //-   button(v-if="!showDashboard", @click="showDashboard = true") dashboards
        .month-controls()
          template(@click="prevMonth", v-if="currentAdventureMonth != 'apr'")
            button(@click="prevMonth", v-if="currentAdventureMonth != 'apr'")
              .month-title <
          .month-title.month-name {{ currentMonthName[currentAdventureMonth] }}
          button(@click="nextMonth", v-if="currentAdventureMonth != 'sep'")
            .month-title >
        .details-wrapper
          .title view player:
          .view-options
            button(@click="onViewOption('details')", :class="{ active: showDetails }") details
            button(@click="onViewOption('activity')", :class="{ active: showActivity}") activity
            button(@click="onViewOption('progress')", :class="{ active: showProgress }") progress

        .details-wrapper
          .title filter:
          .view-options
            button(@click="toggleCharacterType('all')", :class="{ active: showAllCharacters }") all
            button(@click="toggleCharacterType('light')", :class="{ active: showLightOnly }") light
            button(@click="toggleCharacterType('shadow')", :class="{ active: showShadowOnly }") shadow


    .parchment-page
      .loading-text(v-if="isLoading")
        h1 Conjuring the Data...

      .campaign(v-if="!showDashboard")
        .campaign-view
          .campaign-view-header
            img(src="@/assets/CampaignText.svg" alt="Campaign")
          .campaign-view-content
            .campaign-header-wrapper
              h1 Intro :
            p A group of adventurers are tasked by a mysterious benefactor to complete a legendary trial: The Quest for Vitality. To win the grand prize, they must overcome challenges that test their physical, mental, and social well-being. However, they soon find the challenge isn’t quite what they expected, as a digital entity seems to have pulled a small part of them into a digital realm. Can the adventurers complete the challenge and reclaim control over their digital and physical selves?
            .campaign-header-wrapper
              h1 Adventure Timeline :
            .adventure-timeline-info
              .adventure-wrapper.title
                p MONTH
                p EXACT DATES
                p TITLE
              .adventure-wrapper
                p APRIL
                p April 1 - May 3
                p Escape the Darkness
              .adventure-wrapper
                p MAY
                p May 4 - May 31
                p The Ember Thirst
              .adventure-wrapper
                p JUNE
                p Jun 1 - Jun 28
                p.unrevealed ...Yet to be revealed...
              .adventure-wrapper
                p JULY
                p Jun 29 - Aug 2
                p.unrevealed ...Yet to be revealed...
              .adventure-wrapper
                p AUGUST
                p Aug 3 - Aug 30
                p.unrevealed ...Yet to be revealed...
              .adventure-wrapper
                p SEPTEMBER
                p Aug 31 - Sep 27
                p.unrevealed ...Yet to be revealed...

      .dashboard(v-if="showDashboard")
        template(v-if="!isLoading && selectedPlayer == null")
          .table-wrapper
            table(v-if="showDetails")
              thead
                tr.players-header-wrapper
                  th(v-for="(header, index) in playerColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
              tbody.scrollable-table(v-if="showDetails")
                tr.player-wrapper(v-for="(player, playerIndex) in players" :key="playerIndex", @click="selectedPlayer = player")
                  td(v-for="(header, index) in playerColumns" :class="`col-${header.key}`" :key="index")
                    template(v-if="header.key === 'xp'")
                      .player-xp-bar
                        .player-xp(:style="{ width: player.xpBar + '%' }", v-tooltip="`${Math.round(player.xpBar)}% towards next level`")
                    template(v-else-if="header.key === 'achievements'")
                      template(v-if="player.achievements != '' ")
                        .achievements-wrapper
                          template(v-for="(achievement, index) in player.achievements.slice(0, 4)" :key="index")
                            img.achievement-icon(:src="`/achievements/${achievement.icon}.svg`", alt="Achievements", :class="{ flag: achievement.flag == 'flag' }", v-tooltip="`${achievement.title}`")
                          template(v-if="player.achievements.length > 4")
                            span(v-tooltip="'...click to see more'") ...
                    template(v-else-if="header.key === 'level'")
                      | {{ player.level }}
                    template(v-else-if="header.key === 'avatar'")
                      img(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
                      img(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
                    template(v-else-if="header.key === 'hp'")
                      | {{ player[header.key] }}
                    template(v-else)
                      | {{ player[header.key] }}
        template(v-if="showActivity")
          .table-wrapper
            table
              thead
                tr.players-header-wrapper
                  th(v-for="(header, index) in activityColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
              tbody.scrollable-table
                tr.player-wrapper(v-for="(player, playerIndex) in activePlayers(currentAdventureMonth)" :key="playerIndex")
                  td(v-for="(header, index) in activityColumns" :class="`col-${header.key}`" :key="index")
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
        template(v-if="showProgress")
          .table-wrapper
            table
              thead
                tr.players-header-wrapper
                  th(v-for="(header, index) in progressColumns" :key="index" :data-header="header.key" :class="`col-${header.key}`") {{ header.name }}
              tbody.scrollable-table
                tr.player-wrapper(v-for="(player, playerIndex) in activePlayers(currentAdventureMonth)" :key="playerIndex")
                  td(v-for="(header, index) in progressColumns" :class="`col-${header.key}`" :key="index")
                    template(v-if="header.key === 'avatar'")
                      img(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
                      img(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
                    //- template(v-if="header.key === 'progress_rate'")
                    //-   p {{ player.progressRates[currentAdventureMonth] }}
                    template(v-if="header.key === 'progress'")
                      .progress-bar
                        img.entry(:src="`/progress/entry.png`", alt="Enter!")
                        img.bad-guy(:src="`/progress/${enemies[currentAdventureMonth].name}.png`", alt="The Scald", :style="{'left': `max(0px, calc(${Math.min(enemies[currentAdventureMonth].progressRate, 100)}% - 20px))`}")
                        img.player-av(v-if="player?.playerPng", :src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''", :style="{'left': `max(0px, calc(${Math.min(player.progressRates[currentAdventureMonth], 100)}% - 20px))`}")
                        img.player-av(v-else, :src="`/avatars/default.svg`", alt="Player Avatar")
                        img.escape(:src="`/progress/endpoint.png`", alt="Escape!")
                    template(v-else)
                      | {{ player[header.key] }}

      .player-view-wrapper(v-if="selectedPlayer != null && showDetails")
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

    const showDashboard = ref(true)
    const showPlayerDetails = ref(true)
    const showAllCharacters = ref(true)
    const showShadowOnly = ref(false)
    const showLightOnly = ref(false)

    const currentAdventureMonth = computed(() => {
      const monthKey = months[currentMonthIndex.value]
      console.log(monthKey)
      return monthKey
    })

    const enemies = computed(() => {
      console.log(appStore.dungeonEnemyByMonth)
      return appStore.dungeonEnemyByMonth
    })

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

    const activePlayers = (month: string) => {
      return players.value.filter((player) => player.goalPerWeekByMonth[month] > 0)
    }

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

    const activityColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      { name: 'success rate', key: 'successRate' },
      { name: 'goal per week', key: 'goalPerWeek' },
      { name: 'activity', key: 'activity' },
    ])
    const progressColumns = ref([
      { name: '', key: 'avatar' },
      { name: 'name', key: 'charName' },
      // { name: 'rate', key: 'progress_rate' },
      { name: 'adventure progress', key: 'progress' },
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

    const toggleView = () => {
      showDashboard.value = !showDashboard.value
    }

    const currentDate = ref(moment.utc())

    const currentMonthIndex = ref(0)

    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep']

    const currentMonthRange = computed(() => {
      const monthKey = months[currentMonthIndex.value]
      return adventureMonthMap[monthKey]
    })

    const showDetails = ref(true)
    const showActivity = ref(false)
    const showProgress = ref(false)

    const onViewOption = (type: string) => {
      showDetails.value = type == 'details' ? true : false
      showActivity.value = type == 'activity' ? true : false
      showProgress.value = type == 'progress' ? true : false
    }

    const buttonText = computed(() => {
      if (showDashboard.value) {
        return 'campaign'
      } else {
        return 'dashboard'
      }
    })

    watch(
      currentDate,
      (val) => {
        const monthIndex = months.findIndex((key) => {
          const [start, end] = adventureMonthMap[key]
          return currentDate.value.isSameOrAfter(start) && currentDate.value.isSameOrBefore(end)
        })
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
      buttonText,
      toggleView,
      onViewOption,
      enemies,
      showDashboard,
      showDetails,
      showActivity,
      showProgress,
      players,
      playerColumns,
      activityColumns,
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
      activePlayers,
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
    // height: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1em;
  }
  .month-controls {
    width: 175px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--theme-col-blurple);
    margin-left: 1em;
    button {
      background-color: var(--theme-col-blurple);
      border: none;
      color: #d0d6ff;
      font-size: 1.5rem;
      cursor: pointer;
      margin: 0 1rem;
    }
  }
  .month-title {
    font-family: 'Pixelify Sans', sans-serif;
    font-size: 1.5rem;
    color: #d0d6ff;
    width: 30px;
    &.month-name {
      width: 50px;
    }
  }
  .deep-lore-button {
    button {
      border-radius: 37px;
      border: 2px solid #29f36e;
      width: 150px;
      height: 35px;
      font-size: 1.5rem;
      font-family: 'Grenze Gotisch', serif;
      display: flex;
      justify-content: center;
      margin-left: 1rem;
      align-items: center;
      padding-bottom: 4px;
      cursor: pointer;
      transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
      &:not(.active) {
        background: #d0ffe0;
        color: #005d20;
        box-shadow: 2px 2px 0px 1px #29f36e;
      }
      a {
        text-decoration: none;
        color: #005d20;
      }
      &:hover {
        background: #005d20;
        color: #fff;
        box-shadow: 2px -1px 16px 0px var(--theme-col-med-blurple);
      }
    }
  }
  .view-options-wrapper {
    // background-color: var(--theme-col-light-blurple);
    background-color: var(--theme-col-parchment);
    border-radius: 20px;
    border: 3px solid #a59696;
    padding: 0.5rem 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 3.5rem;
    width: 100%;

    .details-wrapper {
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
        width: 75px;
        height: 25px;
        font-size: 0.9rem;
        font-family: 'Space Grotesk', serif;
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
  .filter-options-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    height: 4rem;
    width: 100%;
    .details-wrapper {
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
        width: 60px;
        height: 25px;
        font-size: 0.9rem;
        font-family: 'Space Grotesk', serif;
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
    display: flex;
    justify-content: center;
    height: 20px;
    align-items: center;
    .achievement-icon {
      // width: 20px;
      height: 20px;
      // height: 100%;
      margin-right: 0.5em;
      &.flag {
        height: 35px;
      }
    }
    img {
      width: 30px;
    }
  }
  .player-wrapper {
    cursor: pointer;
    &:hover {
      color: var(--theme-col-blurple);
    }
  }
  .parchment-page {
    width: 100%;
    height: 100%;
    padding: 3em 5em 3em 3em;
    // padding-right: 5em;
    background-image: url('@/assets/parchment.svg'); /* Adjust path as needed */
  }
  .progress-bar {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    position: relative;
    // padding-left: 2em;
    .bad-guy {
      height: 40px;
      position: absolute;
    }
    .player-av {
      height: 40px;
      position: absolute;
    }
    .entry {
      height: 40px;
      margin-right: auto;
    }
    .escape {
      height: 40px;
      margin-left: auto;
    }
  }
}

.campaign-view {
  padding: 0 4.8rem 2.5rem 2.5rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .campaign-view-header {
    img {
      height: 10rem;
    }
  }
  .campaign-view-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 50vh;
    text-align: center;
    // justify-content: center;
    // height: 100%;
    background-color: var(--theme-col-parchment-light);
    border-radius: 30px;
    padding: 1rem 6rem;
    font-family: 'Space Grotesk', sans-serif;
    .campaign-header-wrapper {
      width: 100%;
      display: flex;
      justify-content: left;
      h1 {
        font-size: 2rem;
        color: var(--theme-col-blurple);
        // text-align: center;
      }
    }
    .adventure-timeline-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      .adventure-wrapper {
        width: 600px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &.title {
          p {
            font-size: 1rem;
            font-weight: 700;
          }
        }
      }
      p {
        width: 200px;
        text-align: center;
        font-size: 1rem;
        color: var(--theme-col-brown);
        // margin: 0.5rem 0;
        // text-align: center;
        &.unrevealed {
          font-style: italic;
        }
      }
    }
  }
}
</style>
