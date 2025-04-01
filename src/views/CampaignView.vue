<template lang="pug">
.campaign-view
  .campaign-view-header
    img(src="@/assets/CampaignText.svg" alt="Campaign")
  .campaign-view-content
    .campaign-header-wrapper
      h1 Intro :
    p A group of adventurers are tasked by a mysterious benefactor to complete a legendary trial: The Quest for Vitality. To win the grand prize, they must overcome challenges that test their physical, mental, and social well-being. However, they soon find the challenge isn’t quite what they expected, as a digital entity seems to have pulled a small part of them into a digital realm. Can the adventurers complete the challenge and reclaim control over their digital and physical selves?
    .campaign-header-wrapper
      h1 Adventure Timeline :
    .adventure-timeline-info
      .adventure-wrapper.title
        p MONTH
        p EXACT DATES
        p TITLE
      .adventure-wrapper
        p APRIL
        p April 1 - May 3
        p Escape the Darkness
      .adventure-wrapper
        p MAY
        p May 4 - May 31
        p.unrevealed ...Yet to be revealed...
      .adventure-wrapper
        p JUNE
        p Jun 1 - Jun 28
        p.unrevealed ...Yet to be revealed...
      .adventure-wrapper
        p JULY
        p Jun 29 - Aug 2
        p.unrevealed ...Yet to be reveale...
      .adventure-wrapper
        p AUGUST
        p Aug 3 - Aug 30
        p.unrevealed ...Yet to be revealed...
      .adventure-wrapper
        p SEPTEMBER
        p Aug 31 - Sep 27
        p.unrevealed ...Yet to be revealed...
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
    padding: 1rem 6rem;
    font-family: 'Space Grotesk', sans-serif;
    .campaign-header-wrapper {
      width: 100%;
      display: flex;
      justify-content: left;
      h1 {
        font-size: 3rem;
        color: var(--theme-col-blurple);
        // text-align: center;
      }
    }
    .adventure-timeline-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      .adventure-wrapper {
        width: 600px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &.title {
          p {
            font-size: 1rem;
            font-weight: 700;
          }
        }
      }
      p {
        width: 200px;
        text-align: center;
        font-size: 1rem;
        color: var(--theme-col-brown);
        // margin: 0.5rem 0;
        // text-align: center;
        &.unrevealed {
          font-style: italic;
        }
      }
    }
  }
}
</style>
