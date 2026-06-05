import React from 'react'
import { Box, Typography, Select, MenuItem, FormControl, Paper } from '@mui/material'

const Z_BORDER = '#dde3e8'

export default function ModuleSelector({ modules, value, onChange }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, bgcolor: '#fff', borderColor: Z_BORDER }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', minWidth: 90 }}>
          Select Module
        </Typography>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            value={value}
            onChange={e => onChange(e.target.value)}
            displayEmpty
            renderValue={v => v || <span style={{ color: '#9ca3af' }}>-- Select a Module --</span>}
            sx={{
              bgcolor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: Z_BORDER },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a65db' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a65db' },
            }}
          >
            {modules.map(m => (
              <MenuItem key={m.api_name} value={m.api_name}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )
}
