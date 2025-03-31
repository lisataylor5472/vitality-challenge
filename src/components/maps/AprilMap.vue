<template lang="pug">
.month-map.april-map(ref="mapRef")
  svg(:viewBox.camel="viewBox", :width="mapWidth", :height="mapHeight", xmlns="http://www.w3.org/2000/svg", fill="none", preserveAspectRatio="xMidYMid meet")
    template(v-for="(player, playerIx) in players")
      path(ref="playerPathsRef", :d="line(player.pathPoints)", fill="none", :stroke="debug ? 'red' : 'none'", stroke-width="2")
      //- foreignObject.avatar-wrapper(:x="xScale(player.successRate)", :y="yScale(player.successRate)", width="100", height="100")
      foreignObject.avatar-wrapper(:x="getPlayerX(player, playerIx)", :y="getPlayerY(player, playerIx)", width="100", height="100", style="overflow: visible")
        img.avatar(:src="player.playerPng", :alt="player.charName", :title="player.charName")
  input(v-if="debug", type="range", v-model="successRate", min="0", max="100", step="0.1")
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'

import * as d3 from 'd3'
import { useAppStore } from '@/store/app'

export default defineComponent({
  setup(props, ctx) {
    const mapRef = ref()
    const playerPathsRef = ref<SVGPathElement[]>()

    /** Shows the paths in red along with a slider to test success rate */
    const debug = ref(false)

    const mapWidth = ref(1000)
    const mapHeight = ref(1000)
    const viewBox = computed(() => `0 0 ${mapWidth.value} ${mapHeight.value}`)

    const successRate = ref(0)

    const appStore = useAppStore()
    const _players = computed(() => appStore.playerTracker)
    const playersWithPaths = computed(() => {
      return _players.value.map((player: any) => {
        return {
          ...player,
          playerPng: player.playerPng ? `/avatars/${player.playerPng}` : '/avatars/default.svg',
          pathPoints: d3.range(11).map((i) => {
            return {
              x: i * 10,
              y: Math.random() * 100,
            }
          }),
        }
      })
    })
    const players = computed(() => {
      return playersWithPaths.value.map((player: any) => {
        return {
          ...player,
          successRate: debug.value ? successRate.value : (player.successRate ?? 0),
        }
      })
    })

    const yScale = computed(() => {
      return d3.scaleLinear().domain([0, 100]).range([0, mapHeight.value])
    })

    const xScale = computed(() => {
      return d3.scaleLinear().domain([0, 100]).range([0, mapWidth.value])
    })

    const line = computed(() => {
      return d3
        .line()
        .x((d: any) => xScale.value(d.x))
        .y((d: any) => yScale.value(d.y))
        .curve(d3.curveMonotoneX)
    })

    const getPlayerX = (player: any, playerIx: number) => {
      const playerPath = playerPathsRef.value?.[playerIx]
      if (playerPath == null) return 0

      const scale = d3.scaleLinear(
        [0, 100],
        [0, playerPathsRef.value?.[playerIx].getTotalLength() ?? 100],
      )
      const playerPoint = playerPathsRef.value?.[playerIx].getPointAtLength(
        scale(player.successRate),
      )
      return playerPoint?.x ?? 0
    }
    const getPlayerY = (player: any, playerIx: number) => {
      const playerPath = playerPathsRef.value?.[playerIx]
      if (playerPath == null) return 0

      const scale = d3.scaleLinear(
        [0, 100],
        [0, playerPathsRef.value?.[playerIx].getTotalLength() ?? 100],
      )
      const playerPoint = playerPathsRef.value?.[playerIx].getPointAtLength(
        scale(player.successRate),
      )
      return playerPoint?.y ?? 0
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        mapWidth.value = Math.floor(width)
        mapHeight.value = Math.floor(height)
      }
    })
    onMounted(() => {
      ro.observe(mapRef.value)
    })
    onUnmounted(() => {
      ro.unobserve(mapRef.value)
    })

    return {
      mapRef,
      playerPathsRef,
      debug,
      line,
      xScale,
      yScale,
      players,
      mapWidth,
      mapHeight,
      viewBox,
      successRate,
      getPlayerX,
      getPlayerY,
    }
  },
})
</script>
<style lang="scss">
.april-map {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background-color: black;
  padding: 5em 2em;
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    .avatar-wrapper {
      .avatar {
        width: auto;
        height: 100%;
        transform: translate(-50%, -50%);
        // border-radius: 50%;
        // position: absolute;
        // transform: translate(-50%, -50%);
      }
    }
  }
}
</style>
