import { useState, useEffect, useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Grid, TextField } from '@mui/material'

export default function App() {
  const [costs, setCosts] = useState(new Map<string, number>())

  const addCost = (label: string, cost: number) => {
    setCosts((prev) => new Map([...prev, [label, cost]]))
  }
  const removeCost = (label: string) => {
    setCosts((prev) => {
      const newMap = new Map(prev)
      newMap.delete(label)
      return newMap
    })
  }

  return (
    <Box>
      <Grid container>
        <Grid item>
          <TextField id="standard-basic" label="Standard" variant="standard" />
        </Grid>
        <Grid item>
          <TextField id="standard-basic" label="Standard" variant="standard" />
        </Grid>
      </Grid>
    </Box>
  )
}
