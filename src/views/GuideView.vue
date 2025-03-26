<template lang="pug">
.guide-view
  .guide-header
    img(src="@/assets/GuideText.svg" alt="Guide")
  .guide-content-wrapper
    .guide-options-wrapper
      .guide-option
        h3 Overview
      .guide-option
        h3 Character Creation
      .guide-option
        h3 Oath Crafting
      .guide-option
        h3 Timeline
    .guide-details-wrapper
      .guide-details.overview
        h1 Getting Started
        h3 Step 1: Join the Slack Channel
        h3 Step 2: Create a Character
        h3 Step 3: Craft an Oath
        h1 Challenge Overview
        p Players



</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'GuideView',
  setup() {
    return {
      slackChannelName: '#Quest-for-Vitality',
    }
  },
})
</script>

<style lang="scss" scoped>
.guide-view {
  padding: 0 4.8rem 2.5rem 2.5rem;
  height: 100%;
  .guide-header {
    border-bottom: 1px solid var(--theme-col-brown);
    img {
      height: 9rem;
    }
  }
  .guide-content-wrapper {
    height: 50vh;
    // border: 1px solid var(--theme-col-brown);
    display: flex;
    padding: 1rem;
    .guide-options-wrapper {
      // border: 1px solid red;
      width: 30%;
      padding: 1rem;
      .guide-option {
        border: 2px solid var(--theme-col-light-blurple);
        background-color: var(--theme-col-blurple);
        height: 3rem;
        text-align: center;
        border-radius: 30ch;
        margin-bottom: 1rem;
        box-shadow: 6px 6px 0px -1px var(--theme-col-light-blurple);
        display: flex;
        justify-content: center;
        align-items: center;
        h3 {
          color: var(--theme-col-white);
        }
      }
    }
    .guide-details-wrapper {
      // border: 1px solid blue;
      background-color: var(--theme-col-parchment-light);
      width: 70%;
      border-radius: 30px;
      padding: 1rem 1.5rem;
    }
  }
}
</style>
