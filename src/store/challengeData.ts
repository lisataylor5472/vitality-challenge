import { defineStore } from 'pinia'

// Define the state type
interface ChallengeDataState {
  challengeData: object
}

// Create the Pinia store
export const useChallengeDataStore = defineStore('challengeData', {
  state: (): ChallengeDataState => ({
    challengeData: {},
  }),
  // getters: {
  //   doubleCount: (state) => state.count * 2,
  // },
  // actions: {
  //   increment() {
  //     this.count++
  //   },
  //   decrement() {
  //     this.count--
  //   },
  //   async asyncIncrement() {
  //     setTimeout(() => {
  //       this.count++
  //     }, 1000)
  //   },
  // },
})
