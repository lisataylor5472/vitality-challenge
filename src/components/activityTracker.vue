<template lang="pug">
div
  .header
    h2 {{ currentMonthName }} {{ currentYear }}
    .buttons
      button(@click="prevMonth")
        h1 <
      button(@click="nextMonth")
        h1 >
  table
    thead
      tr
        th(v-for="day in daysOfWeek" :key="day") {{ day }}
    tbody
      tr(v-for="(week, index) in calendar" :key="index")
        td(
          v-for="(day, index) in week"
          :key="index"
          :class="{ 'today': isToday(day), 'other-month': day.month !== currentMonth, 'green-dot': oathUpheldDay(day) }"
        ) {{ day.day }}
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'

interface Day {
  day: number
  month: number
}

export default defineComponent({
  name: 'ActivityTracker',
  props: {
    activityData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const currentDate = ref(new Date())
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const currentYear = computed(() => currentDate.value.getFullYear())
    const currentMonth = computed(() => currentDate.value.getMonth())
    const currentMonthName = computed(() =>
      currentDate.value.toLocaleString('default', { month: 'long' }),
    )

    const calendar = computed(() => {
      const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
      const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
      const daysInMonth = lastDayOfMonth.getDate()
      const startingDay = firstDayOfMonth.getDay()

      let dayCounter = 1
      const calendar: Day[][] = []

      for (let i = 0; i < 6; i++) {
        const week: Day[] = []
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < startingDay) {
            const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
            week.push({
              day: daysInPrevMonth - (startingDay - j - 1),
              month: currentMonth.value - 1,
            })
          } else if (dayCounter <= daysInMonth) {
            week.push({ day: dayCounter, month: currentMonth.value })
            dayCounter++
          } else {
            week.push({ day: dayCounter - daysInMonth, month: currentMonth.value + 1 })
            dayCounter++
          }
        }
        calendar.push(week)
      }
      return calendar
    })

    const isToday = (day: Day): boolean => {
      const today = new Date()
      return (
        day.day === today.getDate() &&
        day.month === today.getMonth() &&
        currentYear.value === today.getFullYear()
      )
    }

    const oathUpheldDay = (day: Day): boolean => {
      const date = new Date(currentYear.value, day.month, day.day)
      const formattedDate = date.toISOString().split('T')[0] + 'T07:00:00.000Z'
      return props.activityData.some(
        (activity: { date: string }) => activity.date === formattedDate,
      )
    }

    const prevMonth = (): void => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }

    const nextMonth = (): void => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }

    return {
      currentDate,
      daysOfWeek,
      currentYear,
      currentMonth,
      currentMonthName,
      calendar,
      isToday,
      oathUpheldDay,
      prevMonth,
      nextMonth,
    }
  },
})
</script>

//
<style lang="scss" scoped>
table {
  // width: 30%;
  // border-collapse: collapse;
  font-size: 0.8rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: 1rem;
}

th,
td {
  // border: 1px solid #ccc;
  padding: 2px;
  text-align: center;
  width: 35px; /* Set a fixed width */
  height: 35px; /* Set a fixed height */
  // line-height: 40px; /* Center text vertically */
}

td {
  border-radius: 50%;
  background-color: var(--theme-col-parchment);
}

th {
  // font-family: 'unifrakturCook', serif;
  font-family: 'Space Grotesk', serif;
  color: var(--theme-col-blurple);
}

.today {
  background-color: #eee;
}

.other-month {
  color: #ccc;
}

.green-dot {
  background-color: var(--theme-col-green);
  color: white;
  border-radius: 50%;
  // width: 10px;
  // height: 10px;
}
button {
  background-color: var(--theme-col-parchment-lights);
  border: none;
  color: var(--theme-col-blurple);
  font-size: 1.5rem;
  cursor: pointer;
  margin: 0 1rem;
}
</style>
