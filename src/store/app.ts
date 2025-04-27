import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import moment from 'moment'

interface challengeData {
  playerTracker: []
  activityTracker: []
  oathTracker: []
  achievementTracker: []
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
    // const goalPerWeek = findGoalPerWeek(player.playerId)
    const goalPerWeek = findGoalPerWeek(player)

    // Filter activity data for the current player
    let playerActivity = activityData.value
      .filter((activity: any) => {
        if (player.isShadow || player.isPersonalOnly) {
          return (
            activity.playerId === player.playerId && activity.questType.includes('Personal Oath')
          )
        }
        return activity.playerId === player.playerId && activity.questType.includes('GS Oath')
      })
      .map((activity: any) => activity)

    // Merge activities with the same date
    playerActivity = playerActivity.reduce((acc: any[], activity: any) => {
      const existingActivity = acc.find((a) => a.date === activity.date)
      if (existingActivity) {
        if (typeof existingActivity.questType === 'string') {
          existingActivity.questType = existingActivity.questType
            .split(',')
            .map((item: string) => item.trim())
        }
        if (typeof activity.questType === 'string') {
          activity.questType = activity.questType.split(',').map((item: string) => item.trim())
        }
        existingActivity.questType = Array.from(
          new Set([...existingActivity.questType, ...activity.questType]),
        )
      } else {
        if (activity.questType == null) {
          activity.questType = []
        }
        if (typeof activity.questType === 'string') {
          activity.questType = activity.questType.split(',').map((item: string) => item.trim())
        }
        acc.push({ ...activity, questType: [...activity.questType] })
      }
      return acc
    }, [])

    const monthlyCounts = {}

    for (let week = 1; week <= 52; week++) {
      const weekKey = `W${week}`
      const date = moment().month(0).startOf('month').week(week)
      const monthKey = date.format('MM')
      monthlyCounts[monthKey] = monthlyCounts[monthKey] || {}
      monthlyCounts[monthKey][weekKey] = { count: 0, successRate: null }
    }

    // Calculate weekly and monthly counts
    playerActivity.forEach((activity) => {
      const date = activity.date
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
    const { totalXp, playerLevel, levelPercent, successRate, currentSuccessRate } = findPlayerXp(
      goalPerWeek,
      monthlyCounts,
      player.playerId,
    )

    // Find players achievements
    const playerAchievements = achievementsData.value
      .filter((ach: any) => {
        if (player.isShadow) {
          return ach.playerId === player.playerId && ach.isShadow
        } else if (player.isPersonalOnly) {
          return ach.playerId === player.playerId && ach.isPersonalOnly
        }
        return ach.playerId === player.playerId && ach.isShadow == false
      })
      .map((ach: any) => ach)

    player.activity = playerActivity
    player.totalXp = totalXp
    player.xpBar = levelPercent
    player.level = playerLevel
    player.monthProgressRate = successRate
    player.successRate = currentSuccessRate
    player.achievements = playerAchievements
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

  const findGoalPerWeek = (player: any) => {
    // TODO - update to handle changing oaths/goalPerWeek .. yikes
    const playerId = player.playerId
    const playerOath = oathTracker.value.find(
      (oath) =>
        oath.playerId == playerId && (player.isShadow ? oath.isShadow : oath.isShadow == false),
    )
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

    let currentAdventureProgress = 0

    // Calculate current adventure progress
    if (monthlyCounts[currentMonth]) {
      let weekKeys = Object.keys(monthlyCounts[currentMonth])

      // Do not count the first week of April (W14) in the progress calculation
      // This was tutorial week and should not count
      if (currentMonth == '04') {
        weekKeys = weekKeys.splice(1, 4)
        console.log('weekKeys after', weekKeys)
      }

      const currentWeekIndex = weekKeys.indexOf(`${currentWeek}`) + 1

      currentAdventureProgress = currentWeekIndex / weekKeys.length
    }

    // IF the current week is not in the monthlyCounts, add it
    // Occurs on Sunday when the week changes - and no events have been logged yet
    if (monthlyCounts[currentMonth][currentWeek].successRate == null) {
      monthlyCounts[currentMonth][currentWeek].successRate = 0
    }

    // Set the first week of April W14 to a successRate of null ---
    // this was tutorial week and should not count
    monthlyCounts['04']['W14'].successRate = null

    const weeks = monthlyCounts[currentMonth]
    const weeklyRates = Object.entries(weeks)
      .filter(([week, { successRate }]) => successRate != null)
      .map(([week, { successRate }]) => successRate)
    Object.entries(monthlyCounts).forEach(([_, weeks]) => {
      Object.entries(weeks).forEach(([week, { count }]) => {
        if (goalPerWeek == 7 && count == goalPerWeek) {
          totalXp += 38.5
        } else if (count > goalPerWeek && goalPerWeek > 0) {
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

    const currentSuccessRate =
      weeklyRates.length == 0
        ? 0
        : weeklyRates
            .slice(0, -1) // Exclude the last (incomplete) week
            .reduce((sum, rate) => sum + rate, 0) / (weeklyRates.length - 1 || 1)

    const successRate = Math.round(totalSuccessRate * currentAdventureProgress * 100)

    // Find level XP based on total XP
    Object.entries(levelThresholds).forEach(([level, thresholds]) => {
      const [minXp, maxXp] = thresholds
      if (totalXp >= minXp && totalXp < maxXp) {
        playerLevel = parseInt(level)
        levelPercent = ((totalXp - minXp) / (maxXp - minXp)) * 100
      }
    })

    return { totalXp, playerLevel, levelPercent, successRate, currentSuccessRate }
  }

  const playerTracker = computed(() => data.value?.playerTracker || [])
  const activityData = computed(() => data.value?.activityTracker || [])
  const oathTracker = computed(() => data.value?.oathTracker || [])
  const achievementsData = computed(() => data.value?.achievementTracker || [])

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

  return {
    data,
    isLoading,
    fetchChallengeData,
    playerTracker,
    activityData,
    oathTracker,
    achievementsData,
  }
})
