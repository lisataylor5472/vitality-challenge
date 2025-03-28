<template lang="pug">
.map-view
  .map-view-header
    img(src="@/assets/MapText.svg" alt="Map")
  .map-view-content
    h1 To be unveiled April 1

</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MapView',
})
</script>

<style lang="scss" scoped>
.map-view {
  padding: 0 4.8rem 2.5rem 2.5rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .map-view-header {
    img {
      height: 10rem;
    }
  }
  .map-view-content {
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
