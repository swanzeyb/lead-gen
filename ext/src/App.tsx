import { useEffect } from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import { useMutation, useQuery } from '@tanstack/react-query'

const columns: GridColDef[] = [
  {
    field: 'item',
    headerName: 'Item',
    width: 150,
    editable: true,
  },
  {
    field: 'cost',
    headerName: 'Cost',
    width: 150,
    editable: true,
  },
  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (params: GridValueGetterParams) =>
  //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  // },
]

// const rows = [{ id: 0, item: 'hi', cost: 'test' }]

const getUrl = (): Promise<URL> =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(new URL(tabs[0].url || ''))
    })
  })

const getKey = (key: string): Promise<any> =>
  new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result)
    })
  })

export default function DataGridDemo() {
  useEffect(() => {
    getUrl().then((url) => {
      console.log(url)
    })
  }, [])

  const url = use(getUrl())
  console.log('url', url)

  const updateRow = useMutation({
    mutationFn: async (newRow) => {
      const url = await getUrl()
      const masterKey = url.host + url.pathname + ':rows'

      const rows = (await getKey(masterKey)).filter(
        (row: any) => row.id !== newRow.id
      )
      await chrome.storage.local.set({ [masterKey]: [...rows, newRow] })

      return newRow
    },
    onMutate: async (newRow) => {
      console.log('onMutate', newRow)
      return newRow
    },
    onError: (error, variables, context) => {
      console.log('onError', error, variables, context)
    },
    onSuccess: (data, variables, context) => {
      console.log('onSuccess', data, variables, context)
    },
  })

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        // initialState={{
        //   pagination: {
        //     paginationModel: {
        //       pageSize: 5,
        //     },
        //   },
        // }}
        // pageSizeOptions={[5]}
        // checkboxSelection
        disableRowSelectionOnClick
        processRowUpdate={(updatedRow, originalRow) => {
          console.log(updateRow.mutate(updatedRow))
          return updatedRow
        }}
        onStateChange={(state) => {}}
      />
    </Box>
  )
}
