import React from 'react'
import {
  Box, Typography, Paper, Select, MenuItem, TextField,
  IconButton, Stack, Button, Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

const Z_BORDER = '#dde3e8'
const selectSx = {
  bgcolor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: Z_BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a65db' },
}

const AGG_FNS = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN']

function newAgg() { return { id: Date.now().toString(), function: 'SUM', field: '', alias: '' } }

export default function AggregationPanel({ fields, aggregations, groupBy, onChangeAgg, onChangeGroupBy }) {
  const aggFields   = fields.filter(f => f.is_aggregatable)
  const groupFields = fields.filter(f => f.is_groupable)
  const currentGB   = groupBy[0]?.field || ''

  const setGB = val => {
    if (!val) { onChangeGroupBy([]); return }
    const f = fields.find(x => x.api_name === val)
    onChangeGroupBy([{ field: val, is_lookup: f?.is_lookup || false }])
  }

  return (
    <Paper variant="outlined" sx={{ bgcolor: '#fff', borderColor: Z_BORDER, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${Z_BORDER}`, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Aggregation</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>— summarize data with SUM, AVG, COUNT, etc.</Typography>
        <Box component="span" sx={{ ml: 'auto', fontSize: '0.68rem', color: '#9ca3af', fontStyle: 'italic' }}>optional</Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {aggregations.length === 0 && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mb: 1 }}>No aggregation — raw rows returned.</Typography>
        )}

        <Stack spacing={1}>
          {aggregations.map(agg => (
            <AggRow key={agg.id} agg={agg} fields={aggFields}
              onChange={p => onChangeAgg(aggregations.map(a => a.id === agg.id ? { ...a, ...p } : a))}
              onRemove={() => onChangeAgg(aggregations.filter(a => a.id !== agg.id))}
            />
          ))}
        </Stack>

        <Button size="small" startIcon={<AddIcon />}
          onClick={() => onChangeAgg([...aggregations, newAgg()])}
          disabled={aggFields.length === 0}
          sx={{ mt: 0.75, color: '#1a65db', fontWeight: 600, fontSize: '0.78rem', px: 1 }}>
          Add Function
        </Button>

        {aggregations.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>GROUP BY</Typography>
              <Select value={currentGB} onChange={e => setGB(e.target.value)}
                size="small" displayEmpty sx={{ minWidth: 200, ...selectSx }}
                renderValue={v => v ? (fields.find(f => f.api_name === v)?.label || v) : <span style={{ color: '#9ca3af' }}>Select grouping field…</span>}>
                <MenuItem value="">None</MenuItem>
                {groupFields.map(f => <MenuItem key={f.api_name} value={f.api_name}>{f.is_lookup ? `◆ ${f.label}` : f.label}</MenuItem>)}
              </Select>
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  )
}

function AggRow({ agg, fields, onChange, onRemove }) {
  const autoAlias = agg.function && agg.field ? `${agg.function}_${agg.field.split('.').pop()}` : ''
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Select value={agg.function} onChange={e => onChange({ function: e.target.value })}
        size="small" sx={{ minWidth: 85, ...selectSx }}>
        {AGG_FNS.map(fn => <MenuItem key={fn} value={fn}>{fn}</MenuItem>)}
      </Select>

      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>(</Typography>
      <Select value={agg.field} onChange={e => onChange({ field: e.target.value, alias: `${agg.function}_${e.target.value.split('.').pop()}` })}
        size="small" displayEmpty sx={{ minWidth: 155, ...selectSx }}
        renderValue={v => v ? (fields.find(f => f.api_name === v)?.label || v) : <span style={{ color: '#9ca3af' }}>Field</span>}>
        {fields.map(f => <MenuItem key={f.api_name} value={f.api_name}>{f.label}</MenuItem>)}
      </Select>
      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>)</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>AS</Typography>

      <TextField value={agg.alias || autoAlias} onChange={e => onChange({ alias: e.target.value })}
        size="small" placeholder={autoAlias || 'alias'}
        sx={{ width: 130, '& .MuiOutlinedInput-notchedOutline': { borderColor: Z_BORDER }, '& input': { fontSize: '0.82rem' } }}
      />

      <IconButton size="small" onClick={onRemove} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' }, p: 0.5 }}>
        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Stack>
  )
}
