import { useEffect, useState } from 'react'
import Table from './Table'
import { Button } from '@mui/material'

export default function App() {
  const [info, setInfo] = useState<any>()

  useEffect(() => {
    setInterval(() => {})
  }, [])

  return (
    <div>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      {/* <pre>{chrome.storage}</pre> */}
      {/* <Button onClick={refresh}>Refresh Page</Button> */}
    </div>
  )
}
