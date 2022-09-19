import React, { useRef } from 'react'
import useStore from "../store/store"

const Component2 = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const addWord = useStore((state) => state.addWord)
  const add = () => {
    if (inputRef.current != null) {
      addWord(inputRef.current.value)
    }
  }
  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={add}> add one word</button>
    </div>
  )
}

export default Component2
