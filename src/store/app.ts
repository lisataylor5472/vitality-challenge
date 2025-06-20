import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import moment from 'moment'

interface challengeData {
  playerTracker: []
  activityTracker: []
  oathTracker: []
  achievementTracker: []
  dungeonTracker: []
  lylaActivityData: []
  dungeonEnemy: []
  dungeonElements: []
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
      isLoading.value = false
    }
  }

  const computePlayerStats = (player: any) => {
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

    // console.log('player activity', playerActivity)

    if (player.playerId == 'LYLA') {
      // console.log('LYLA', lylaActivityData.value)
      playerActivity = lylaActivityData.value
      playerActivity = playerActivity.filter((activity: any) => activity.date !== '')
      if (playerActivity[0].date == '#N/A') {
        playerActivity = []
      }
      // console.log('LYLA', lylaActivityData.value)
    }

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

    for (let week = 14; week <= 39; week++) {
      const weekKey = `W${week}`
      const date = moment().month(0).startOf('month').week(week)
      const monthKey = date.format('MMM').toLowerCase()
      monthlyCounts[monthKey] = monthlyCounts[monthKey] || {
        goalPerWeek: findGoalPerWeek(player, monthKey),
        weeks: {},
      }
      monthlyCounts[monthKey].weeks[weekKey] = { count: 0, successRate: 0 }
    }

    const goalPerWeekByMonth = {}

    Object.keys(monthlyCounts).map((month) => {
      goalPerWeekByMonth[month] = monthlyCounts[month].goalPerWeek
    })

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
        Object.keys(monthlyCounts[month].weeks).includes(weekKey),
      )
      monthlyCounts[monthKey].weeks[weekKey].count += 1
      monthlyCounts[monthKey].weeks[weekKey].successRate =
        monthlyCounts[monthKey].weeks[weekKey].count /
        (monthlyCounts[monthKey].goalPerWeek > 0 ? monthlyCounts[monthKey].goalPerWeek : 1)
    })

    const findSuccessRates = (monthlyCounts) => {
      const currentWeekNumber = moment().week()

      const ratesByMonth = {}

      Object.keys(monthlyCounts).forEach((month) => {
        const weeks = Object.fromEntries(
          // Filter out any FUTURE weeks
          Object.entries(monthlyCounts[month].weeks).filter(([weekKey]) => {
            const weekNumber = parseInt(weekKey.slice(1))
            return weekNumber <= currentWeekNumber
          }),
        )
        if (weeks['W14']) {
          delete weeks['W14']
        }
        // Map all the rates in our current selection
        const successRates = Object.values(weeks).map((week) => week.successRate)

        if (successRates.length > 0) {
          ratesByMonth[month] = Math.round(
            (successRates.reduce((sum, rate) => sum + rate) / successRates.length) * 100,
          )
        }
      })

      Object.keys(ratesByMonth).forEach((month) => {
        if (ratesByMonth[month] === null) {
          delete ratesByMonth[month]
        }
      })

      // if (player.playerId == 'U03EBQ5M40M') {
      //   console.log('success rates=', ratesByMonth)
      // }

      return ratesByMonth
    }

    const findProgressRates = (successRatesByMonth, monthlyCounts, player) => {
      const currentWeekNumber = moment().week()

      const ratesByMonth = {}

      // Find how many weeks are in each month, and determine how many weeks are 'complete'(in the past)
      Object.keys(successRatesByMonth).forEach((month) => {
        const weeks = monthlyCounts[month].weeks
        const totalWeeks = Object.keys(weeks).length
        const completedWeeks = Object.keys(weeks).filter(
          (week) => parseInt(week.slice(1)) <= currentWeekNumber,
        ).length

        const adventureProgress = (completedWeeks >= 1 ? completedWeeks : 1) / totalWeeks
        // if (player.playerId == 'U03EBQ5M40M') {
        //   console.log('current Adventure Progress=', adventureProgress)
        // }
        ratesByMonth[month] = Math.round(adventureProgress * successRatesByMonth[month])
      })

      // Add dungeon tracker data to ratesByMonth
      Object.keys(ratesByMonth).forEach((month) => {
        const dungeonData = dungeonTracker.value.filter(
          (event) => event.playerId === player.playerId && event.month === month,
        )
        dungeonData.forEach((event) => {
          if (event.eventType == 'progress') {
            ratesByMonth[month] = (ratesByMonth[month] || 0) + event.quantity
          }
        })
      })

      // if (player.playerId == 'U03EBQ5M40M') {
      //   console.log('progress rates=', ratesByMonth)
      // }

      return ratesByMonth
    }

    const findPlayerHp = (player) => {
      const dungeonData = dungeonTracker.value.filter((event) => event.playerId === player.playerId)
      let hp = 20
      dungeonData.forEach((event) => {
        if (event.eventType == 'hp') {
          hp += event.quantity
        }
      })

      return hp
    }

    // Calculate their total success rate for the month
    const successRatesByMonth = findSuccessRates(monthlyCounts)

    // Calculate how far along the adventure path the character is
    const progressRatesByMonth = findProgressRates(successRatesByMonth, monthlyCounts, player)

    // Calculate total XP and level based on weekly counts
    const { totalXp, playerLevel, levelPercent } = findPlayerXp(monthlyCounts, player.playerId)

    const playerHp = findPlayerHp(player)

    // Collect all achievements
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

    const successAvg =
      Object.values(successRatesByMonth).reduce((sum, rate) => sum + rate, 0) /
        Object.values(successRatesByMonth).length || 0

    // console.log(player.charName)
    // console.log(successRatesByMonth)
    player.activity = playerActivity
    player.totalXp = totalXp
    player.xpBar = levelPercent
    player.level = playerLevel
    player.progressRates = progressRatesByMonth
    player.successRates = successRatesByMonth
    player.successAvg = successAvg
    player.goalPerWeekByMonth = goalPerWeekByMonth
    player.achievements = playerAchievements
    player.hp = playerHp
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

  const findGoalPerWeek = (player: any, month: any) => {
    const playerId = player.playerId
    const playerOath = oathTracker.value
      .filter(
        (oath) =>
          oath.playerId == playerId && (player.isShadow ? oath.isShadow : oath.isShadow == false),
      )
      .find((oath) => oath.month == month)
    return playerOath ? playerOath.xPerWeek : 0
  }

  const findPlayerXp = (monthlyCounts: any) => {
    const currentWeekNumber = moment().week()
    let totalXp = 0
    let playerLevel = 1
    let levelPercent = 0

    Object.keys(monthlyCounts).forEach((month) => {
      Object.keys(monthlyCounts[month].weeks).forEach((weekKey) => {
        const weekNumber = parseInt(weekKey.slice(1), 10)
        if (weekNumber < currentWeekNumber) {
          const successRate = monthlyCounts[month].weeks[weekKey].successRate
          if (successRate > 1) {
            totalXp += 36
            if (successRate > 1.5) {
              totalXp += 2
            }
          } else if (successRate == 1) {
            // If they upheld their oath - they will have a successRate of 1 - give 35 xp
            totalXp += 35
          } else if (successRate < 1 && successRate > 0) {
            // If they partially upheld their oath, give them a partial week's credit
            totalXp += 35 * successRate
          } else if (successRate == 0) {
            // No succes, no xp
            totalXp += 0
          }
        }
      })
    })
    // console.log(totalXp)

    // Find level XP based on total XP
    Object.entries(levelThresholds).forEach(([level, thresholds]) => {
      const [minXp, maxXp] = thresholds
      if (totalXp >= minXp && totalXp < maxXp) {
        playerLevel = parseInt(level)
        levelPercent = ((totalXp - minXp) / (maxXp - minXp)) * 100
      }
    })

    totalXp = Math.round(totalXp)

    // console.log('totalXp - 2nd Time', totalXp)

    return { totalXp, playerLevel, levelPercent }
  }

  const playerTracker = computed(() => data.value?.playerTracker || [])
  const activityData = computed(() => data.value?.activityTracker || [])
  const lylaActivityData = computed(() => data.value?.lylaActivityData || [])
  const oathTracker = computed(() => data.value?.oathTracker || [])
  const achievementsData = computed(() => data.value?.achievementTracker || [])
  const dungeonEnemy = computed(() => data.value?.dungeonEnemy || [])
  const dungeonElements = computed(() => data.value?.dungeonElements || [])
  const dungeonTracker = computed(() => data.value?.dungeonTracker || [])

  const dungeonEnemyByMonth = {}
  const dungeonElementsByMonth = {}

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

  watch(dungeonEnemy, (newVal) => {
    newVal.forEach((enemy) => {
      if (!dungeonEnemyByMonth[enemy.month]) {
        dungeonEnemyByMonth[enemy.month] = {
          name: enemy.name,
          progressRate: enemy.progressRate,
          hp: enemy.hp,
          hpMax: enemy.hpMax,
          disName: enemy.disName,
          speed: enemy.speed,
        }
      }
    })
  })

  watch(dungeonElements, (newVal) => {
    newVal.forEach((element) => {
      if (!dungeonElementsByMonth[element.month]) {
        dungeonElementsByMonth[element.month] = {
          chest1Location: element.chest1Location,
          chest1Visible: element.chest1Visible,
          chest1Exhausted: element.chest1Exhausted,
          chest2Location: element.chest2Location,
          chest2Visible: element.chest2Visible,
          chest2Exhausted: element.chest2Exhausted,
          chest3Location: element.chest3Location,
          chest3Visible: element.chest3Visible,
          chest3Exhausted: element.chest3Exhausted,
          chest4Location: element.chest4Location,
          chest4Visible: element.chest4Visible,
          chest4Exhausted: element.chest4Exhausted,
        }
      }
    })
  })

  return {
    data,
    isLoading,
    fetchChallengeData,
    playerTracker,
    dungeonEnemy,
    activityData,
    oathTracker,
    achievementsData,
    dungeonEnemyByMonth,
    dungeonElementsByMonth,
    dungeonTracker,
  }
})
