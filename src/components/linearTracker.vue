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
    // currentDate: {
    //   type: Date,
    //   required: true,
    // },
  },
  setup(props) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const calendar = computed(() => {
      // console.log('current adventure month ', props.currentAdventureMonth)
      // console.log('current Month Range', props.currentMonthRange)
      // console.log('type current Month Range', typeof props.currentMonthRange)
      // console.log('type 0 current Month Range', typeof props.currentMonthRange[0])

      const startOfMonth = props.currentMonthRange[0].startOf('day')
      const endOfMonth = props.currentMonthRange[1].endOf('day')
      const days: Day[] = []
      const currentDay = startOfMonth.clone()

      // console.log('currentDay', currentDay)
      while (currentDay.isSameOrBefore(endOfMonth)) {
        const day: Day = {
          day: currentDay.date(),
          month: currentDay.month(),
        }
        // console.log(day)

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
