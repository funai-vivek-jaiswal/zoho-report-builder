import React from 'react'
import {
  Box, Typography, List, ListItemButton, ListItemText,
  Stack, IconButton, Chip, Divider, Tooltip, Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'

const Z_BORDER  = '#dde3e8'
const Z_ACTIVE  = '#e8f0fe'
const Z_ACTIVE2 = '#d0e2fd'

export default function PresetList({ presets, activePresetId, onLoad, onDelete, onNew }) {
  const owned  = presets.filter(p =>  p.is_owner)
  const shared = presets.filter(p => !p.is_owner)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 1.75, pb: 1, borderBottom: `1px solid ${Z_BORDER}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2b4a', letterSpacing: 0.2 }}>
            Saved Presets
          </Typography>
          <Tooltip title="New report" arrow>
            <IconButton size="small" onClick={onNew}
              sx={{ color: '#1a65db', bgcolor: '#f0f5ff', borderRadius: 1, p: 0.4, '&:hover': { bgcolor: '#dde8ff' } }}>
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Empty */}
        {owned.length === 0 && shared.length === 0 && (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <InsertChartOutlinedIcon sx={{ fontSize: 30, color: '#c5ccd6', mb: 1 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              No presets yet.<br />Build a report and save it.
            </Typography>
          </Box>
        )}

        {/* My Presets */}
        {owned.length > 0 && (
          <>
            <Typography sx={{ px: 2, py: 0.75, fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              My Presets
            </Typography>
            <List dense disablePadding>
              {owned.map(p => (
                <PresetItem key={p.id} preset={p} active={p.id === activePresetId} onLoad={onLoad} onDelete={onDelete} />
              ))}
            </List>
          </>
        )}

        {/* Shared */}
        {shared.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 2, py: 0.75 }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Shared With Me
              </Typography>
            </Stack>
            <List dense disablePadding>
              {shared.map(p => (
                <PresetItem key={p.id} preset={p} active={p.id === activePresetId} onLoad={onLoad} onDelete={null} />
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  )
}

function PresetItem({ preset, active, onLoad, onDelete }) {
  return (
    <ListItemButton
      selected={active}
      onClick={() => onLoad(preset)}
      sx={{
        px: 2, py: 0.9, mx: 0, borderRadius: 0,
        borderLeft: active ? '3px solid #1a65db' : '3px solid transparent',
        bgcolor: active ? Z_ACTIVE : 'transparent',
        '&:hover': { bgcolor: active ? Z_ACTIVE : '#f5f6f8' },
        '&.Mui-selected': { bgcolor: Z_ACTIVE },
        '&.Mui-selected:hover': { bgcolor: Z_ACTIVE2 },
      }}
    >
      <ListItemText
        primary={
          <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 600 : 400, color: active ? '#1a65db' : '#1a2b4a', lineHeight: 1.3 }} noWrap>
            {preset.name}
          </Typography>
        }
        secondary={
          <Stack direction="row" spacing={0.5} mt={0.25} alignItems="center">
            <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>{preset.primary_module}</Typography>
            {!preset.is_owner && (
              <Chip label="Shared" size="small"
                sx={{ height: 14, fontSize: '0.58rem', bgcolor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', px: 0.25 }} />
            )}
          </Stack>
        }
        sx={{ my: 0 }}
      />
      {onDelete && (
        <Tooltip title="Delete" arrow>
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onDelete(preset.id) }}
            sx={{
              opacity: 0, p: 0.25, ml: 0.5,
              '.MuiListItemButton-root:hover &': { opacity: 1 },
              transition: 'opacity 0.15s',
              color: '#ef4444',
              '&:hover': { bgcolor: '#fef2f2' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      )}
    </ListItemButton>
  )
}
