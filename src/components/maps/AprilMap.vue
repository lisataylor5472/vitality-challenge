<template lang="pug">
.month-map.april-map(ref="mapRef")
  svg(:viewBox.camel="viewBox", :width="mapWidth", :height="mapHeight", xmlns="http://www.w3.org/2000/svg", fill="none", preserveAspectRatio="none")
    image(href="@/assets/maps/rat_dungeon_map.svg", x="0", y="-230px", width="100%", preserveAspectRatio="none")

    template(v-for="(player, playerIx) in players")
      path(ref="playerPathsRef", :d="getPlayerPath(player, playerIx)", fill="none", :stroke="debug ? player.pathColor : 'none'", stroke-width="2")
      image.avatar(:href="player.playerPng", :alt="player.charName", :title="player.charName", :x="getPlayerX(player, playerIx) - 50", :y="getPlayerY(player, playerIx) - 50", width="100", height="100", :class="{'shadow': player.isShadow}")
  input(v-if="debug", type="range", v-model="successRate", min="0", max="100", step="0.1")
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'

import * as d3 from 'd3'
import { useAppStore } from '@/store/app'

export default defineComponent({
  setup(props, ctx) {
    const mapRef = ref()
    const playerPathsRef = ref<SVGPathElement[]>()

    /** Shows the paths in red along with a slider to test success rate */
    const debug = ref(false)

    const mapWidth = ref(924)
    const mapHeight = ref(461)
    const viewBox = computed(() => `0 0 ${mapWidth.value} ${mapHeight.value}`)

    const successRate = ref(0)

    const totalMapPoints = ref(5)

    const appStore = useAppStore()
    const _players = computed(() => appStore.playerTracker)
    const playersWithPaths = computed(() => {
      return _players.value.map((player: any, ix: number, arr: any[]) => {
        const mapPath: number[] | null = !!player.mapPath
          ? // if a player has a pre-defined path, use that
            player.mapPath.split(',').map((y: string) => {
              return parseFloat(y.trim())
            })
          : // otherwise, generate a random path
            d3.range(1, totalMapPoints.value + 1).map(() => {
              return Math.random() * 100
            })
        return {
          ...player,
          playerPng: player.playerPng ? `/avatars/${player.playerPng}` : '/avatars/default.svg',
          pathColor: player.mapPath ? 'blue' : 'red', // for debugging
          mapPath: [
            // create an initial point at the left side of the map
            // that spaces out the points evenly on the y axis
            {
              x: 0,
              y: ix * (100 / arr.length),
            },
            // then add the rest of the points
            ...(mapPath ?? []).map((y: number, i: number) => {
              return {
                x: (i + 1) * (100 / totalMapPoints.value),
                y,
              }
            }),
          ],
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
      return d3.scaleLinear().domain([100, 0]).range([0, mapHeight.value])
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

    const getPlayerPath = (player: any, playerIx: number) => {
      const playerPath = player.mapPath
      if (playerPath == null) return 'M0,0'

      const path = line.value(playerPath)
      return path
    }

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
      if (!mapRef.value) return
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
      getPlayerPath,
    }
  },
})
</script>
<style lang="scss">
.april-map {
  // width: 100%;
  height: 50vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background-color: #222222;
  overflow: hidden;
  // background-image: url('@/assets/maps/rat_dungeon_map.svg');
  padding: 5em 1em;
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    align-items: center;
    .avatar {
      &.shadow {
        filter: grayscale(10);
      }
    }
  }
}
</style>
