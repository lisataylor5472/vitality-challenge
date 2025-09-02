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
          img(v-if="dateAfter('apr')" src="@/assets/flags/flexibility-flag.svg" alt="Flexibility Dungeon Flag")
          img(v-else src="@/assets/flags/rolled-flag-rat.svg" alt="Flexibility Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.snail
            img(v-if="dateAfter('may')" src="@/assets/flags/hydration-flag.svg" alt="Snail Dungeon Flag")
            img(v-else src="@/assets/flags/rolled-flag-snail.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.ladder
            img(v-if="dateAfter('jun')" src="@/assets/flags/cardio-flag.svg" alt="Ladder Flag")
            img(v-else src="@/assets/flags/rolled-flag-ladder.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.feast
            img(v-if="dateAfter('jul')" src="@/assets/flags/feast-flag.svg")
            img(v-else src="@/assets/flags/rolled-flag-feast.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.benny
            img(v-if="dateAfter('aug')" src="@/assets/flags/strength-flag.svg")
            img(v-else src="@/assets/flags/rolled-flag-benny.svg" alt="Future Dungeon Flag")
        .adventure-flag
          .rolled-up-flag.final
            img(v-if="dateAfter('sep')" src="@/assets/flags/final-flag.svg")
            img(v-else src="@/assets/flags/rolled-flag-final.svg" alt="Future Dungeon Flag")
      //- .nav-wrapper
        //- RouterLink.nav-button(
        //-   to="/"
        //-   custom
        //-   v-slot="{ navigate, isActive }"
        //- )
        //-   button(@click="navigate", :class="{ active: isActive }")
        //-     | dashboard
        //- RouterLink.nav-button(to="/map" custom v-slot="{ navigate, isActive }")
        //-   button(@click="navigate", :class="{ active: isActive }")
        //-     | progress
        //- RouterLink.nav-button(to="/campaign" custom v-slot="{ navigate, isActive }")
        //-   button(@click="navigate", :class="{ active: isActive }")
        //-     | campaign

  .main-content
    .left-column
      SvgLeaderboard(:currentAdventureMonth="currentAdventureMonth")
    .right-column
      RouterView
      //- .parchment-page
.right-panel
</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import SvgLeaderboard from '@/components/SvgLeaderboard.vue'
import moment from 'moment'

export default defineComponent({
  name: 'App',
  components: {
    RouterLink,
    RouterView,
    SvgLeaderboard,
  },

  setup() {
    const appStore = useAppStore()

    const dateAfter = (month: string) => {
      const monthMap = {
        apr: moment('2025-03-31'),
        may: moment('2025-05-03'),
        jun: moment('2025-05-31'),
        jul: moment('2025-06-28'),
        aug: moment('2025-08-02'),
        sep: moment('2025-08-30'),
      }
      const currentDay = moment()
      return monthMap[month] <= currentDay
    }

    onMounted(() => {
      appStore.fetchChallengeData()
    })

    return {
      appStore,
      dateAfter,
    }
  },
})
</script>

<style lang="scss" scoped>
.header-wrapper {
  height: 18vh;
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
    background-image: url('@/assets/noise.png');
  }
  .header-banner {
    // flex-basis: 38%;
    .title-svg {
      height: 28vh;
      z-index: 5;
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
      }
    }
    .nav-wrapper {
      height: 7vh;
      display: flex;
      justify-content: flex-start;
      padding: 1rem 0.5rem;
      margin-right: 20rem;
      align-items: end;
      .nav-button {
        border-radius: 37px;
        border: 2px solid #29f36e;
        width: 120px;
        height: 35px;
        // background: #d0ffe0;
        // box-shadow: 4px 4px 0px -1px #29f36e;
        // color: #005d20;
        font-size: 1.5rem;
        font-family: 'Grenze Gotisch', serif;
        display: flex;
        justify-content: center;
        margin-left: 1rem;
        align-items: center;
        padding-bottom: 4px;
        cursor: pointer;
        transition:
          transform 0.1s ease,
          box-shadow 0.1s ease;
        &:not(.active) {
          background: #d0ffe0;
          color: #005d20;
          box-shadow: 2px 2px 0px 1px #29f36e;
        }
        &.active {
          background: #005d20;
          color: #fff;
          box-shadow:
            2px 2px 0px 1px #29f36e,
            2px -1px 16px 0px var(--theme-col-med-blurple);
        }
        a {
          text-decoration: none;
          color: #005d20;
        }
        &:hover {
          background: #005d20;
          color: #fff;
          box-shadow: 2px -1px 16px 0px var(--theme-col-med-blurple);
        }
      }
    }
  }
}
.main-content {
  display: flex;
  justify-content: space-between;
  padding: 0 2rem 2rem 0;
  height: 80vh;
  .left-column {
    width: 20%;
    padding-top: 4rem;
  }
  .right-column {
    width: 85%;
  }
  // .parchment-page {
  //   width: 100%;
  //   height: 100%;
  //   background-image: url('@/assets/parchment.svg'); /* Adjust path as needed */
  // }
}
</style>
