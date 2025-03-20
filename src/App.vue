<template lang="pug">
  .header-wrapper
    .header-stripe
    .header-banner
      img.title-svg(src="@/assets/title-banner.svg" alt="Title Banner")
    .header-details
      .flags-wrapper
        .adventure-flag
          | flag
        .adventure-flag
          | flag
        .adventure-flag
          | flag
        .adventure-flag
          | flag
        .adventure-flag
          | flag
        .adventure-flag
          | flag
      .nav-wrapper
        button.nav-button
          RouterLink(to="/") dashboard
        button.nav-button
          RouterLink(to="/guide") guide
        button.nav-button
          RouterLink(to="/map") map
        button.nav-button
          RouterLink(to="/campaign") campaign

  .main-content
    .left-column
      .leaderboard-wrapper
        PlayerLeaderboard
        p(v-if="appStore.isLoading") Loading...
    .right-column
      RouterView



</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import PlayerLeaderboard from '@/components/PlayerLeaderboard.vue'
import { defineComponent, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
// import axios from 'axios'

export default defineComponent({
  name: 'App',
  components: {
    PlayerLeaderboard,
    RouterLink,
    RouterView,
  },

  setup() {
    const appStore = useAppStore()

    onMounted(() => {
      appStore.fetchChallengeData()
      // axios
      //   .get(
      //     'https://script.google.com/macros/s/AKfycbxKvbADAy07czWN4j2WSeT0UBbtoVnuOF3-sGgYmTtAi6EJ2eo7d0I8daJFPSEIOfc6/exec',
      //   )
      //   .then((response) => {
      //     console.log(response)
      //   })
    })
    return { appStore }
  },
})
</script>

<style lang="scss" scoped>
.header-wrapper {
  height: 20vh;
  display: flex;
  align-items: center;
  border: 1px solid green;
  position: relative;
  justify-content: space-between;
  .header-stripe {
    height: 100px;
    background: #603bb1;
    width: 100%;
    position: absolute;
    z-index: -1;
  }
  .header-banner {
    border: 1px solid red;
    flex-basis: 40%;
    .title-svg {
      width: 100%;
      height: auto;
    }
  }
  .header-details {
    // width: 100%;
    flex-basis: 55%;
    .flags-wrapper {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      border: 1px solid blue;
      // width: 100%;
      border-top: 4px solid brown;
      height: 8vh;
      margin-top: 2vh;
      .adventure-flag {
        border: 1px solid red;
      }
    }
    .nav-wrapper {
      height: 10vh;
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      align-items: end;
      .nav-button {
        border-radius: 37px;
        border: 2px solid #29f36e;
        width: 125px;
        height: 40px;
        background: #d0ffe0;
        box-shadow: 4px 4px 0px -1px #29f36e;
        font-size: 1.5rem;
        font-weight: bold;
        color: #005d20;
        font-family: 'Grenze Gotisch', serif;
        a {
          text-decoration: none;
          color: #005d20;
        }
      }
    }
  }
}
.main-content {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 1rem;
  border: 1px solid orange;
  height: 75vh;
  .left-column {
    width: 25%;
    border: 1px solid pink;
  }
  .leaderboard-wrapper {
    border: 1px solid purple;
    padding: 1rem;
  }
  .right-column {
    width: 70%;
    border: 1px solid yellow;
  }
}
</style>
