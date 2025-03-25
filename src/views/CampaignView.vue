<template lang="pug">
.campaign-view
  .campaign-view-header
    img(src="@/assets/CampaignText.svg" alt="Campaign")
  .campaign-view-content

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
}
</style>
