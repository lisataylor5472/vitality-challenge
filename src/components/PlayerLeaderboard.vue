<template lang="pug">
.leaderboard-background
  img(src="@/assets/leaderboard.svg" alt="Leaderboard")

</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PlayerLeaderBoard',
  components: {},
})
</script>

<style lang="scss" scoped>
.leaderboard-background {
  width: 60px;
  height: 100%;
}
</style>
