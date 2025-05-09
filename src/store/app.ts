import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import moment from 'moment'

interface challengeData {
  playerTracker: []
  activityTracker: []
  oathTracker: []
  achievementTracker: []
  lylaActivityData: []
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
        monthlyCounts[monthKey].weeks[weekKey].count / monthlyCounts[monthKey].goalPerWeek
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
        // console.log('weeks', weeks)
        if (weeks['W14']) {
          delete weeks['W14']
        }
        // Map all the rates in our current selection
        const successRates = Object.values(weeks).map((week) => week.successRate)

        // console.log('successRates', successRates)

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

      return ratesByMonth
    }

    const findProgressRates = (successRatesByMonth, monthlyCounts) => {
      const currentWeekNumber = moment().week()

      const ratesByMonth = {}

      // Find how many weeks are in each month, and determine how many weeks are 'complete'(in the past)
      Object.keys(successRatesByMonth).forEach((month) => {
        const weeks = monthlyCounts[month].weeks
        const totalWeeks = Object.keys(weeks).length
        const completedWeeks = Object.keys(weeks).filter(
          (week) => parseInt(week.slice(1)) < currentWeekNumber,
        ).length

        const adventureProgress = completedWeeks / totalWeeks
        ratesByMonth[month] = Math.round(adventureProgress * successRatesByMonth[month])
      })

      // console.log('findProgressRates', ratesByMonth)

      return ratesByMonth
    }

    // Calculate their total success rate for the month
    const successRatesByMonth = findSuccessRates(monthlyCounts)

    // Calculate how far along the adventure path the character is
    const progressRatesByMonth = findProgressRates(successRatesByMonth, monthlyCounts)

    // Calculate total XP and level based on weekly counts
    const { totalXp, playerLevel, levelPercent } = findPlayerXp(monthlyCounts, player.playerId)

    // monthly counts
    //     "apr": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W14": {
    //                 "count": 5,
    //                 "successRate": 1
    //             },
    //             "W15": {
    //                 "count": 6,
    //                 "successRate": 1
    //             },
    //             "W16": {
    //                 "count": 5,
    //                 "successRate": 1
    //             },
    //             "W17": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W18": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },
    //     "may": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W19": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W20": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W21": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W22": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },
    //     "jun": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W23": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W24": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W25": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W26": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },
    //     "jul": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W27": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W28": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W29": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W30": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W31": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },
    //     "aug": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W32": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W33": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W34": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W35": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },
    //     "sep": {
    //         "successRate": null,
    //         "progressRate": null,
    //         "weeks": {
    //             "W36": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W37": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W38": {
    //                 "count": 0,
    //                 "successRate": null
    //             },
    //             "W39": {
    //                 "count": 0,
    //                 "successRate": null
    //             }
    //         }
    //     },

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

    player.activity = playerActivity
    player.totalXp = totalXp
    player.xpBar = levelPercent
    player.level = playerLevel
    player.progressRates = progressRatesByMonth
    player.successRates = successRatesByMonth
    player.successAvg = successAvg
    player.goalPerWeekByMonth = goalPerWeekByMonth
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
  // const findPlayerXp = (goalPerWeek: int, monthlyCounts: any, playerId: any) => {
  //   let totalXp = 0
  //   let playerLevel = 1
  //   let levelPercent = 0

  //   const startOfWeekDate = moment().startOf('week') // Find the first day of the given date's week
  //   const endOfWeekDate = moment().endOf('week') // Find the last day of the given date's week
  //   const weekForDay =
  //     startOfWeekDate.month() < endOfWeekDate.month() ? startOfWeekDate : endOfWeekDate

  //   const week = weekForDay.week()
  //   const currentWeek = `W${week}`
  //   const currentMonth = Object.keys(monthlyCounts).find((month) =>
  //     Object.keys(monthlyCounts[month]).includes(currentWeek),
  //   )

  //   let currentAdventureProgress = 0

  //   // Calculate current adventure progress
  //   if (monthlyCounts[currentMonth]) {
  //     let weekKeys = Object.keys(monthlyCounts[currentMonth])

  //     // Do not count the first week of April (W14) in the progress calculation
  //     // This was tutorial week and should not count
  //     if (currentMonth == 'apr') {
  //       weekKeys = weekKeys.splice(1, 4)
  //     }

  //     const currentWeekIndex = weekKeys.indexOf(`${currentWeek}`) + 1

  //     currentAdventureProgress = currentWeekIndex / weekKeys.length
  //   }

  //   // IF the current week is not in the monthlyCounts, add it
  //   // Occurs on Sunday when the week changes - and no events have been logged yet
  //   if (monthlyCounts[currentMonth][currentWeek].successRate == null) {
  //     monthlyCounts[currentMonth][currentWeek].successRate = 0
  //   }

  //   // Set the first week of April W14 to a successRate of null ---
  //   // this was tutorial week and should not count
  //   monthlyCounts['apr']['W14'].successRate = null

  //   const weeks = monthlyCounts[currentMonth]
  //   const weeklyRates = Object.entries(weeks)
  //     .filter(([week, { successRate }]) => successRate != null)
  //     .map(([week, { successRate }]) => successRate)
  //   Object.entries(monthlyCounts).forEach(([_, weeks]) => {
  //     Object.entries(weeks).forEach(([week, { count }]) => {
  //       if (goalPerWeek == 7 && count == goalPerWeek) {
  //         totalXp += 38.5
  //       } else if (count > goalPerWeek && goalPerWeek > 0) {
  //         totalXp += 38.5
  //       } else if (count == goalPerWeek) {
  //         totalXp += 35
  //       } else if (count < goalPerWeek && count > 0) {
  //         totalXp += (count / goalPerWeek) * 35
  //       } else {
  //         totalXp += 0
  //       }
  //     })
  //   })

  //   // Calculate player success rate
  //   const totalSuccessRate =
  //     weeklyRates.length == 0
  //       ? 0
  //       : weeklyRates.reduce((sum, rate) => sum + rate, 0) / weeklyRates.length

  //   const currentSuccessRate =
  //     weeklyRates.length == 0
  //       ? 0
  //       : weeklyRates
  //           .slice(0, -1) // Exclude the last (incomplete) week
  //           .reduce((sum, rate) => sum + rate, 0) / (weeklyRates.length - 1 || 1)

  //   const successRate = Math.round(totalSuccessRate * currentAdventureProgress * 100)

  //   // Find level XP based on total XP
  //   Object.entries(levelThresholds).forEach(([level, thresholds]) => {
  //     console.log(monthlyCounts)
  //     const [minXp, maxXp] = thresholds
  //     if (totalXp >= minXp && totalXp < maxXp) {
  //       playerLevel = parseInt(level)
  //       levelPercent = ((totalXp - minXp) / (maxXp - minXp)) * 100
  //     }
  //   })

  //   return { totalXp, playerLevel, levelPercent, successRate, currentSuccessRate }
  // }

  const playerTracker = computed(() => data.value?.playerTracker || [])
  const activityData = computed(() => data.value?.activityTracker || [])
  const lylaActivityData = computed(() => data.value?.lylaActivityData || [])
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
