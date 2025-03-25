<template lang="pug">
.left-panel
.app-wrapper
  .header-wrapper
    .header-stripe
    .header-banner
      img.title-svg(src="@/assets/title-banner.svg" alt="Title Banner")
    .header-details
      .flag-pole
      .flags-wrapper
        .adventure-flag.rat
          img(v-if="dateAfter('apr')" src="@/assets/flags/rat-large.svg" alt="Rat Dungeon Flag")
          img(v-else src="@/assets/flags/rolled-flag-rat.svg" alt="Rat Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.snail
            img(v-if="dateAfter('may')" src="@/assets/flags/snail-flag-large.svg" alt="Snail Dungeon Flag")
            img(v-else src="@/assets/flags/rolled-flag-snail.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.ladder
            img(v-if="dateAfter('jun')" src="@/assets/flags/ladder-flag-large.svg" alt="Ladder Flag")
            img(v-else src="@/assets/flags/rolled-flag-ladder.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.feast
            img(v-if="dateAfter('jul')" src="@/assets/flags/feast-flag-large.svg")
            img(v-else src="@/assets/flags/rolled-flag-feast.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.benny
            img(v-if="dateAfter('aug')" src="@/assets/flags/benny-flag-large.svg")
            img(v-else src="@/assets/flags/rolled-flag-benny.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.final
            img(v-if="dateAfter('sep')" src="@/assets/flags/final-flag-large.svg")
            img(v-else src="@/assets/flags/rolled-flag-final.svg" alt="Future Dungeon Flag")
      .nav-wrapper
        button.nav-button
          RouterLink(to="/") guide
        button.nav-button
          RouterLink(to="/players") players
        button.nav-button
          RouterLink(to="/map") map
        button.nav-button
          RouterLink(to="/campaign") campaign

  .main-content
    .left-column
      SvgLeaderboard(:topPlayers="topPlayers")
      //- PlayerLeaderboard
    .right-column
      //- .parchment-wrapper
      //-   img(src="@/assets/parchment1.svg" alt="Parchment")
      .parchment-page
        RouterView
      //- ParchmentPage
.right-panel
</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, onMounted, ref } from 'vue'
import { useAppStore } from '@/store/app'
import PlayerLeaderboard from '@/components/PlayerLeaderboard.vue'
import SvgLeaderboard from '@/components/SvgLeaderboard.vue'

export default defineComponent({
  name: 'App',
  components: {
    RouterLink,
    RouterView,
    PlayerLeaderboard,
    SvgLeaderboard,
  },

  setup() {
    const appStore = useAppStore()

    const dateAfter = (month: string) => {
      const monthMap = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      }
      const currentMonth = new Date().getMonth()
      return monthMap[month] <= currentMonth
    }

    const topPlayers = ref([
      { name: 'Lisa', class: 'Warrior', level: 5, xp: 100, achievements: 3 },
      { name: 'Bob', class: 'Mage', level: 3, xp: 50, achievements: 1 },
      { name: 'Joe', class: 'Rogue', level: 4, xp: 75, achievements: 2 },
    ])

    onMounted(() => {
      appStore.fetchChallengeData()
    })

    return {
      appStore,
      dateAfter,
      topPlayers,
    }
  },
})
</script>

<style lang="scss" scoped>
.header-wrapper {
  height: 22vh;
  display: flex;
  align-items: center;
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
    flex-basis: 38%;
    .title-svg {
      height: 28vh;
      // width: 100%;
      // height: auto;
    }
  }
  .header-details {
    flex-basis: 60%;
    .flag-pole {
      width: 100%;
      height: 25px;
      background: var(--theme-col-brown-light);
      border: 3px solid var(--theme-col-brown);
    }
    .flags-wrapper {
      display: flex;
      justify-content: space-between;
      padding: 0 1rem;
      height: 10vh;
      .adventure-flag {
        img {
          width: 100px;
          height: auto;
        }
        .rolled-up-flag {
          width: 100px;
        }
        // .rolled-up-flag-css {
        //   width: 100px;
        //   height: 20px;
        //   border-top-left-radius: 8px;
        //   border-bottom-left-radius: 8px;
        //   border-bottom-right-radius: 8px;
        //   box-shadow: 4px 0px 0px 0px #676767;
        // }
        // .snail {
        //   background-color: #3df0fa;
        //   border: 2px solid #17c2ce;
        // }
        // .ladder {
        //   background-color: #17c2ce;
        //   border: 2px solid #3df0fa;
        // }
        // .feast {
        //   background-color: #d4bcfe;
        //   border: 2px solid #a47cdb;
        // }
        // .benny {
        //   background-color: #a47cdb;
        //   border: 2px solid #d4bcfe;
        // }
        // .final {
        //   background-color: #fc795c;
        //   border: 2px solid #fec5b2;
        // }
      }
    }
    .nav-wrapper {
      height: 10vh;
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      margin-right: 10rem;
      align-items: end;
      .nav-button {
        border-radius: 37px;
        border: 2px solid #29f36e;
        width: 120px;
        height: 35px;
        background: #d0ffe0;
        box-shadow: 4px 4px 0px -1px #29f36e;
        font-size: 1.5rem;
        font-weight: bold;
        color: #005d20;
        font-family: 'Grenze Gotisch', serif;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 4px;
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
  padding: 0 2rem 2rem 0;
  height: 73vh;
  .left-column {
    width: 25%;
  }
  .right-column {
    width: 75%;
  }
  .parchment-page {
    width: 100%;
    height: 100%;
    background-image: url('@/assets/parchment.svg'); /* Adjust path as needed */
  }
}
</style>
