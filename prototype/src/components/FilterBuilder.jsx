import React from 'react'
import {
  Box, Typography, Paper, Select, MenuItem, TextField,
  IconButton, Stack, Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { PICKLIST_OPTIONS } from '../mockData.js'

const Z_BORDER = '#dde3e8'

const OPERATORS = {
  Text:     ['=', '!=', 'contains', 'starts with'],
  Number:   ['=', '!=', '>', '<', '>=', '<='],
  Date:     ['=', 'before', 'after'],
  PickList: ['=', '!='],
}

const selectSx = {
  bgcolor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: Z_BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a65db' },
}

function newFilter() { return { id: Date.now().toString(), field: '', operator: '=', value: '' } }

export default function FilterBuilder({ fields, filters, onChange }) {
  return (
    <Paper variant="outlined" sx={{ bgcolor: '#fff', borderColor: Z_BORDER, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${Z_BORDER}`, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Filters / Criteria</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>— narrow down the report data</Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {filters.length === 0 && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mb: 1 }}>No filters applied — all records will be shown.</Typography>
        )}

        <Stack spacing={1}>
          {filters.map((f, i) => (
            <FilterRow
              key={f.id} filter={f} index={i} fields={fields}
              onChange={p => onChange(filters.map(x => x.id === f.id ? { ...x, ...p } : x))}
              onRemove={() => onChange(filters.filter(x => x.id !== f.id))}
            />
          ))}
        </Stack>

        <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...filters, newFilter()])}
          sx={{ mt: 0.75, color: '#1a65db', fontWeight: 600, fontSize: '0.78rem', px: 1 }}>
          Add Criteria
        </Button>
      </Box>
    </Paper>
  )
}

function FilterRow({ filter, index, fields, onChange, onRemove }) {
  const fld = fields.find(f => f.api_name === filter.field)
  const dtype = fld?.data_type || 'Text'
  const ops = OPERATORS[dtype] || ['=', '!=']
  const opts = PICKLIST_OPTIONS[filter.field] || null

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {index > 0 && (
        <Box sx={{ px: 1, py: 0.3, bgcolor: '#f3f4f6', border: `1px solid ${Z_BORDER}`, borderRadius: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b7280' }}>AND</Typography>
        </Box>
      )}
      {index === 0 && <Box sx={{ width: 36, flexShrink: 0 }} />}

      <Select value={filter.field} onChange={e => onChange({ field: e.target.value, operator: '=', value: '' })}
        size="small" displayEmpty sx={{ minWidth: 155, ...selectSx }}
        renderValue={v => v ? (fields.find(f => f.api_name === v)?.label || v) : <span style={{ color: '#9ca3af' }}>Field</span>}>
        {fields.map(f => <MenuItem key={f.api_name} value={f.api_name}>{f.label}</MenuItem>)}
      </Select>

      <Select value={ops.includes(filter.operator) ? filter.operator : ops[0]}
        onChange={e => onChange({ operator: e.target.value, value: '' })}
        size="small" disabled={!filter.field} sx={{ minWidth: 100, ...selectSx }}>
        {ops.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
      </Select>

      {opts ? (
        <Select value={filter.value} onChange={e => onChange({ value: e.target.value })}
          size="small" displayEmpty disabled={!filter.field} sx={{ minWidth: 190, ...selectSx }}
          renderValue={v => v || <span style={{ color: '#9ca3af' }}>Value</span>}>
          {opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>
      ) : (
        <TextField value={filter.value} onChange={e => onChange({ value: e.target.value })}
          size="small" placeholder={dtype === 'Number' ? '0' : dtype === 'Date' ? 'YYYY-MM-DD' : 'Value'}
          disabled={!filter.field} type={dtype === 'Number' ? 'number' : dtype === 'Date' ? 'date' : 'text'}
          sx={{ minWidth: 190, '& .MuiOutlinedInput-notchedOutline': { borderColor: Z_BORDER }, '& input': { fontSize: '0.82rem' } }}
        />
      )}

      <IconButton size="small" onClick={onRemove}
        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' }, p: 0.5 }}>
        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Stack>
  )
}
