<template lang="pug">
.campaign-view
  .campaign-view-header
    img(src="@/assets/CampaignText.svg" alt="Campaign")
  .campaign-view-content
    h1 Overview
    h2 INTRO
    p A group of adventurers are tasked by a mysterious benefactor to complete a legendary trial: The Quest for Vitality. To win the grand prize, they must overcome challenges that test their physical, mental, and social well-being. However, they soon find the challenge isn’t quite what they expected, as a digital entity seems to have pulled a small part of them into a digital realm. Can the adventurers complete the challenge and reclaim control over their digital and physical selves?
    br
    h2 TIMELINE
    p April 1 - AHIRL
    p Each month a new adventure will be rolled out
    br
    h2 APRIL ADVENTURE
    p Escape the Darkness
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CampaignView',
})
</script>

<style lang="scss" scoped>
.campaign-view {
  padding: 0 4.8rem 2.5rem 2.5rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .campaign-view-header {
    img {
      height: 10rem;
    }
  }
  .campaign-view-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 50vh;
    text-align: center;
    // justify-content: center;
    // height: 100%;
    background-color: var(--theme-col-parchment-light);
    border-radius: 30px;
    padding: 1rem 3rem;
    font-family: 'Space Grotesk', sans-serif;
    h1 {
      font-size: 3rem;
      color: var(--theme-col-blurple);
      // text-align: center;
    }
  }
}
</style>
