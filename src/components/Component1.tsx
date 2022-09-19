import React from 'react'
import useStore from '../store/store'

const Component1 = () => {
  const words = useStore(state => state.words)
  return (
    <div>
      <p>there are {words.length} words</p>
      <ul>
        <ul>
          {words.map((word) => <li key={word}>{word}</li>)}
        </ul>
      </ul>
    </div>
  )
}

export default Component1
