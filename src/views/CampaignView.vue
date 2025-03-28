<template lang="pug">
.campaign-view
  .campaign-view-header
    img(src="@/assets/CampaignText.svg" alt="Campaign")
  .campaign-view-content
    h1 To be unveiled April 1
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
    // justify-content: center;
    height: 100%;
    h1 {
      font-size: 3rem;
      color: var(--theme-col-blurple);
      // text-align: center;
    }
  }
}
</style>
