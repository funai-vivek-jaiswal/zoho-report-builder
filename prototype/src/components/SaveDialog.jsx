import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, Stack,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

export default function SaveDialog({ open, onClose, onSave, existingNames }) {
  const [name, setName]       = useState('')
  const [confirm, setConfirm] = useState(false)

  useEffect(() => { if (open) { setName(''); setConfirm(false) } }, [open])

  const isOverwrite = existingNames.includes(name.trim())

  const handleSave = () => {
    if (!name.trim()) return
    if (isOverwrite && !confirm) { setConfirm(true); return }
    onSave(name.trim())
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2, border: '1px solid #dde3e8' } }}>
      <DialogTitle sx={{ pb: 0.5, pt: 2, fontWeight: 700, fontSize: '0.95rem', color: '#1a2b4a' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SaveIcon sx={{ fontSize: 18, color: '#1a65db' }} />
          <span>Save Report Preset</span>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mb: 2 }}>
          Give this report a name so you can reload it later from the preset list.
        </Typography>
        <TextField
          autoFocus fullWidth size="small" label="Preset Name"
          placeholder="e.g. Open Leads by Account"
          value={name}
          onChange={e => { setName(e.target.value); setConfirm(false) }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dde3e8' } }}
        />
        {confirm && isOverwrite && (
          <Alert severity="warning" icon={false} sx={{ mt: 1.5, fontSize: '0.8rem', py: 0.75 }}>
            A preset named <strong>"{name}"</strong> already exists. Click <strong>Overwrite</strong> to replace it.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} size="small"
          sx={{ color: '#6b7280', borderColor: '#dde3e8' }} variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleSave} disabled={!name.trim()}
          color={confirm && isOverwrite ? 'warning' : 'primary'}
          sx={{ fontWeight: 600 }}>
          {confirm && isOverwrite ? 'Overwrite' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
