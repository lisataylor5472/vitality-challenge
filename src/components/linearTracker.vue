<template lang="pug">
.linear-tracker
  div.days-container
    .day(
      v-for="(day, dayIndex) in calendar.flat()"
      :key="dayIndex"
      :class="{ 'green-dot': oathUpheldDay(day) }"
      v-tooltip="`${daysOfWeek[dayIndex % 7]} ${day.month +1}/${day.day}`"
    ) {{ day.day }}
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

interface Day {
  day: number
  month: number
}

export default defineComponent({
  name: 'LinearTracker',
  props: {
    activityData: {
      type: Object,
      required: true,
    },
    currentMonthRange: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const calendar = computed(() => {
      console.log(props.currentMonthRange)
      const startOfMonth = props.currentMonthRange[0].startOf('day')
      const endOfMonth = props.currentMonthRange[1].endOf('day')
      const days: Day[] = []
      const currentDay = startOfMonth.clone()

      while (currentDay.isSameOrBefore(endOfMonth)) {
        const day: Day = {
          day: currentDay.date(),
          month: currentDay.month(),
        }

        days.push(day)

        currentDay.add(1, 'day')
      }

      return days
    })

    const oathUpheldDay = (day: Day): boolean => {
      const date = new Date(2025, day.month, day.day)
      const formattedDate = date.toISOString().split('T')[0] + 'T07:00:00.000Z'
      return props.activityData.some(
        (activity: { date: string }) => activity.date === formattedDate,
      )
    }

    return {
      daysOfWeek,
      calendar,
      oathUpheldDay,
    }
  },
})
</script>

//
<style lang="scss" scoped>
.linear-tracker {
  width: 100%;
}

.days-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.day {
  width: 15px;
  font-size: 0.8em;
  border-radius: 4px;
  background-color: var(--theme-col-parchment);
  color: var(--theme-col-parchment);
  margin-left: 0.1rem;
  position: relative;
  // display: flex;
  &:nth-child(7n) {
    margin-right: 0.3rem;
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 90%;
      background-color: var(--theme-col-brown-light);
      position: absolute;
      top: 0px;
      right: -3px;
    }
  }
  &:last-child {
    &::after {
      display: none;
    }
  }

  // color: var(--theme-col-brown);
}

.other-month {
  font-style: italic;
  // color: #ccc;
}

.green-dot {
  background-color: var(--theme-col-green);
  color: var(--theme-col-green);
  // color: var(--theme-col-dark-green);
  // color: white;
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
