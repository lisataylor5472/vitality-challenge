<template lang="pug">
.leaderboard-content
  h2 In the Lead...
  ul
    li
      | 1.
      span Player 1
      | 100
    li
      | 2.
      span Player 2
      | 90
    li
      | 3.
      span Player 3
      | 80
    li
      | 4.
      span Player 4
      | 70
    li
      | 5.
      span Player 5
      | 60

</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeaderBoard',
  components: {},
})
</script>

<style scoped></style>
