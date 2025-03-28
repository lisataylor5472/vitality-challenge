import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface challengeData {
  playerTracker: []
  activityTracker: []
}

export const useAppStore = defineStore('app', () => {
  const data = ref<challengeData | null>(null)
  const isLoading = ref<boolean>(true)

  async function fetchChallengeData() {
    try {
      isLoading.value = true
      // Simulate API call (replace with actual API endpoint)
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzAcupf6X5p4Gn-Pv6pe1BeYSr0kAOeF_0pHeffLA-zcuaR1vodYoG9ooEaH2biZ-OQ/exec',
      )
      data.value = await response.json()
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      console.log('Data fetched:', data.value)
      isLoading.value = false
    }
  }

  const playerTracker = computed(() => data.value?.playerTracker || [])
  const activityData = computed(() => data.value?.activityTracker || [])

  return { data, isLoading, fetchChallengeData, playerTracker, activityData }
})
