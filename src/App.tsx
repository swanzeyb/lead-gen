import { useEffect, useState } from 'react'
import Table from './Table'

export default function App() {
  const [message, setMessage] = useState('')
  debugger

  useEffect(() => {
    const listener = (message: any) => {
      console.log('Received message', message)
      setMessage(message)
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  return (
    <div>
      <h1>App</h1>
      <pre>{document.body.textContent}</pre>
      <Table />
    </div>
  )
}
