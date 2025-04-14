<template lang="pug">
.character-sheet-wrapper
  .left-column-wrapper
    .character-detail.image
      img(:src="`/avatars/${player.playerPng}`", alt="Player Avatar", :class="player.isShadow ? 'shadow' : ''")
  .middle-column-wrapper
    .character-detail.specs
      .class
        h2 CLASS:
        p {{ player.class }}
      .level
        h2 LEVEL:
        p {{ player.level }}
      .hp
        h2 HP:
        p {{ player.hp }}
    .character-detail.achievements
      h2 Achievements
      template(v-for="achievement in player.achievements")
        img.achievement-icon(:src="`/achievements/${achievement.icon}.svg`", alt="Achievements", width="20px", height="20px", v-tooltip="`${achievement.title}`")
  .right-column-wrapper
    .character-detail.activity
      activityTracker(:activityData="player.activity")

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ActivityTracker from '@/components/activityTracker.vue'

export default defineComponent({
  name: 'CharacterSheet',
  components: {
    ActivityTracker,
  },
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
  setup() {
    // You can access the player prop here
    return {
      // Add your component data here
    }
  },
  methods: {
    // Add your methods here
  },
})
</script>

<style lang="scss" scoped>
.character-sheet-wrapper {
  height: 45vh;
  display: flex;
  justify-content: space-between;
  width: 100%;

  .left-column-wrapper {
    margin-left: 1rem;
    // flex-basis: 35%;
    width: 48%;
    // max-width: 50%;
    flex-shrink: 1;
    // height: 45vh;
    // contain: content;
    .image {
      display: flex;
      justify-content: center;
      height: 100%;
      overflow: hidden;
      img {
        width: 100%;
        object-fit: contain;
      }
    }
  }
  .middle-column-wrapper {
    flex-basis: 5%;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    .specs {
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }
    .achievements {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      .achievement-icon {
        margin: 0.5rem;
      }
    }
  }

  .right-column-wrapper {
    flex-basis: 30%;
    display: flex;
    flex-direction: column;
    justify-content: space-betsween;
    .activity {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1rem;
      // height: 60%;
    }
    .abilities {
      height: 30%;
    }
  }

  .character-detail {
    padding: 0.5rem 1rem;
    border-radius: 10px;
    background-color: var(--theme-col-parchment-light);
  }
}
</style>
