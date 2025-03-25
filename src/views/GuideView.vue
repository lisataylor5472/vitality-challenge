<template lang="pug">
.guide-view
  .guide-view-header
    img(src="@/assets/GuideText.svg" alt="Guide")
  .guide-view-content

</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'GuideView',
})
</script>

<style lang="scss" scoped>
.guide-view {
  padding: 0 4.8rem 2.5rem 2.5rem;
  color: var(--theme-col-brown);
  height: 100%;
  display: flex;
  flex-direction: column;
  .guide-view-header {
    img {
      height: 10rem;
    }
  }
}
</style>
