<template lang="pug">
.map-view
  .map-view-header
    img(src="@/assets/MapText.svg" alt="Map")
  .map-view-content

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
}
</style>
