import create from "zustand"
import { devtools } from "zustand/middleware"

interface TestingStore {
  words: string[]
  addWord: (word: string) => void
}

const useStore = create<TestingStore>()(
  devtools(
    (set) => ({
      words: ["hi", "hello"],
      addWord: (word: string) => set((state) => ({ words: [...state.words, word] }))
    })
  )
)

export default useStore
