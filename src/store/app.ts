import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import moment from 'moment'

interface challengeData {
  playerTracker: []
  activityTracker: []
  oathTracker: []
}

export const useAppStore = defineStore('app', () => {
  const data = ref<challengeData | null>(null)
  const isLoading = ref<boolean>(true)

  async function fetchChallengeData() {
    try {
      isLoading.value = true
      // Simulate API call (replace with actual API endpoint)
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzAcupf6X5p4Gn-Pv6pe1BeYSr0kAOeF_0pHeffLA-zcuaR1vodYoG9ooEaH2biZ-OQ/exec',
      )
      data.value = await response.json()
    } catch (error) {
      isLoading.value = false
      console.error('Failed to fetch data:', error)
    } finally {
      console.log('Data fetched:', data.value)
      isLoading.value = false
    }
  }

  const computePlayerStats = (player: any) => {
    const goalPerWeek = findGoalPerWeek(player.playerId)

    // Filter activity data for the current player
    const playerActivity = activityData.value
      .filter((activity: any) => activity.playerId === player.playerId)
      .map((activity: any) => activity.date)

    const monthlyCounts = {}

    for (let week = 1; week <= 52; week++) {
      const weekKey = `W${week}`
      const date = moment().month(0).startOf('month').week(week)
      const monthKey = date.format('MM')
      monthlyCounts[monthKey] = monthlyCounts[monthKey] || {}
      monthlyCounts[monthKey][weekKey] = { count: 0, successRate: null }
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
      player.playerId,
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

  const findPlayerXp = (goalPerWeek: int, monthlyCounts: any, playerId: any) => {
    let totalXp = 0
    let playerLevel = 1
    let levelPercent = 0

    const startOfWeekDate = moment().startOf('week') // Find the first day of the given date's week
    const endOfWeekDate = moment().endOf('week') // Find the last day of the given date's week
    const weekForDay =
      startOfWeekDate.month() < endOfWeekDate.month() ? startOfWeekDate : endOfWeekDate

    const week = weekForDay.week()
    const currentWeek = `W${week}`
    const currentMonth = Object.keys(monthlyCounts).find((month) =>
      Object.keys(monthlyCounts[month]).includes(currentWeek),
    )

    // const currentMonth = moment().format('MM')
    // const currentMonth = moment().month(2).format('MM')
    // const currentWeek = moment().isoWeek()
    if (playerId == 'test123') {
      console.log('currentWeek', currentWeek)
      console.log('currentMonth', currentMonth)
    }
    let currentAdventureProgress = 0

    // Calculate current adventure progress
    if (monthlyCounts[currentMonth]) {
      const weekKeys = Object.keys(monthlyCounts[currentMonth])
      const currentWeekIndex = weekKeys.indexOf(`${currentWeek}`) + 1

      currentAdventureProgress = currentWeekIndex / weekKeys.length
      if (playerId == 'test123') {
        console.log('currentWeekIndex', currentWeekIndex)
        console.log('weekKeys', weekKeys)
        console.log('monthlyCounts)', monthlyCounts)
        console.log('index', weekKeys.indexOf(`W${currentWeek}`))
      }
    }

    const weeks = monthlyCounts[currentMonth]
    const weeklyRates = Object.entries(weeks)
      .filter(([week, { successRate }]) => successRate != null)
      .map(([week, { successRate }]) => successRate)
    if (playerId == 'test123') {
      console.log('weeklyRates', weeklyRates)
    }
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
    const totalSuccessRate =
      weeklyRates.length == 0
        ? 0
        : weeklyRates.reduce((sum, rate) => sum + rate, 0) / weeklyRates.length
    if (playerId == 'test123') {
      console.log('currentAdventureProgress', currentAdventureProgress)
    }
    console.log('currentAdventureProgress', currentAdventureProgress)
    const successRate = Math.round(totalSuccessRate * currentAdventureProgress * 100)

    // Find level XP based on total XP
    Object.entries(levelThresholds).forEach(([level, thresholds]) => {
      const [minXp, maxXp] = thresholds
      if (totalXp >= minXp && totalXp < maxXp) {
        playerLevel = parseInt(level)
        levelPercent = ((totalXp - minXp) / (maxXp - minXp)) * 100
      }
    })

    return { totalXp, playerLevel, levelPercent, successRate }
  }

  const playerTracker = computed(() => data.value?.playerTracker || [])
  const activityData = computed(() => data.value?.activityTracker || [])
  const oathTracker = computed(() => data.value?.oathTracker || [])

  watch(
    playerTracker,
    (newVal) => {
      newVal.forEach((player) => {
        computePlayerStats(player)
      })
      isLoading.value = false
    },
    { immediate: true },
  )

  return { data, isLoading, fetchChallengeData, playerTracker, activityData, oathTracker }
})
