import React from 'react'
import { Box, Typography, Paper, Checkbox, Stack, Divider, Tooltip, Chip } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'

const Z_BORDER = '#dde3e8'

const TYPE_STYLE = {
  Text:     { bg: '#e0f2fe', color: '#0369a1', label: 'Text' },
  Number:   { bg: '#fef9c3', color: '#854d0e', label: 'Number' },
  Date:     { bg: '#dcfce7', color: '#166534', label: 'Date' },
  PickList: { bg: '#f3e8ff', color: '#6b21a8', label: 'PickList' },
  Lookup:   { bg: '#ffe4e6', color: '#9f1239', label: 'Lookup' },
}

function TypeTag({ type }) {
  const s = TYPE_STYLE[type] || { bg: '#f1f5f9', color: '#475569', label: type }
  return (
    <Box component="span" sx={{
      display: 'inline-block', px: 0.75, py: 0.1,
      bgcolor: s.bg, color: s.color, borderRadius: 1,
      fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.6, whiteSpace: 'nowrap',
    }}>{s.label}</Box>
  )
}

export default function FieldPicker({ fields, selected, onChange }) {
  const selectedKeys = new Set(selected.map(f => f.api_name))

  const toggle = (field) => {
    if (selectedKeys.has(field.api_name)) onChange(selected.filter(f => f.api_name !== field.api_name))
    else onChange([...selected, field])
  }

  const regular = fields.filter(f => !f.is_lookup)
  const lookupGroups = {}
  fields.filter(f => f.is_lookup).forEach(f => {
    const key = f.lookup_prefix || 'Related'
    ;(lookupGroups[key] = lookupGroups[key] || []).push(f)
  })

  return (
    <Paper variant="outlined" sx={{ bgcolor: '#fff', borderColor: Z_BORDER, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${Z_BORDER}`, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Fields</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>— select the columns to display in the report</Typography>
        {selected.length > 0 && (
          <Chip label={`${selected.length} selected`} size="small" color="primary" variant="outlined"
            sx={{ ml: 'auto', height: 18, fontSize: '0.65rem' }} />
        )}
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {fields.length === 0 && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>Select a module above to see available fields.</Typography>
        )}

        {/* Regular fields */}
        {regular.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {regular.map(f => <FieldTag key={f.api_name} field={f} checked={selectedKeys.has(f.api_name)} onToggle={toggle} />)}
          </Box>
        )}

        {/* Lookup groups */}
        {Object.entries(lookupGroups).map(([prefix, flds]) => (
          <Box key={prefix} mt={1.25}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
              <LinkIcon sx={{ fontSize: 13, color: '#9f1239' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9f1239' }}>
                via {prefix}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: '#fecdd3', ml: 0.5 }} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {flds.map(f => <FieldTag key={f.api_name} field={f} checked={selectedKeys.has(f.api_name)} onToggle={toggle} />)}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

function FieldTag({ field, checked, onToggle }) {
  return (
    <Tooltip
      title={<Box>
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>{field.api_name}</Typography>
        {field.is_aggregatable && <Typography variant="caption" display="block" color="warning.light">SUM / AVG / COUNT eligible</Typography>}
        {field.is_groupable    && <Typography variant="caption" display="block" color="success.light">GROUP BY eligible</Typography>}
      </Box>}
      arrow placement="top"
    >
      <Box
        onClick={() => onToggle(field)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5,
          px: 1, py: 0.5, cursor: 'pointer', borderRadius: 1,
          border: `1px solid ${checked ? '#1a65db' : Z_BORDER}`,
          bgcolor: checked ? '#eef3ff' : '#fff',
          '&:hover': { borderColor: '#1a65db', bgcolor: '#f0f5ff' },
          transition: 'all 0.12s',
        }}
      >
        <Checkbox checked={checked} size="small" disableRipple
          sx={{ p: 0, '& .MuiSvgIcon-root': { fontSize: 14, color: checked ? '#1a65db' : '#9ca3af' } }}
          onChange={() => onToggle(field)}
          onClick={e => e.stopPropagation()}
        />
        <Typography sx={{ fontSize: '0.78rem', fontWeight: checked ? 600 : 400, color: checked ? '#1a2b4a' : '#374151', whiteSpace: 'nowrap' }}>
          {field.label}
        </Typography>
        <TypeTag type={field.data_type} />
      </Box>
    </Tooltip>
  )
}
