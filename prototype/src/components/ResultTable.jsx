import React, { useRef, useState, useEffect } from 'react'
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Stack, Chip, Button,
  CircularProgress, Skeleton,
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const Z_BORDER = '#dde3e8'
const Z_TH_BG  = '#edf1f5'
const Z_ROW_H  = '#f0f5ff'

function fmt(val, label) {
  if (val === undefined || val === null || val === '—') return '—'
  if (label && /revenue|amount|total/i.test(label)) {
    const n = Number(val); if (!isNaN(n)) return n.toLocaleString('en-US')
  }
  if (typeof val === 'number') return val.toLocaleString('en-US')
  return String(val)
}

export default function ResultTable({ rows, columns, aggregations, isLoading, page, totalRows, pageSize, onNextPage }) {
  const tableRef = useRef(null)
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    const el = tableRef.current; if (!el) return
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'c') e.preventDefault() }
    el.addEventListener('keydown', h)
    return () => el.removeEventListener('keydown', h)
  }, [])

  const cols = columns.length > 0
    ? columns.map(c => ({ key: c.api_name, label: aggregations.find(a => a.field === c.api_name)?.alias || c.label }))
    : rows.length > 0 ? Object.keys(rows[0]).map(k => ({ key: k, label: k })) : []

  const sorted = [...rows].sort((a, b) => {
    if (!sortCol) return 0
    const cmp = String(a[sortCol] ?? '').localeCompare(String(b[sortCol] ?? ''), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const handleSort = k => {
    if (sortCol === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(k); setSortDir('asc') }
  }

  const hasMore = page * pageSize < totalRows

  return (
    <Paper variant="outlined" sx={{ borderColor: Z_BORDER, overflow: 'hidden' }}>
      {/* Results toolbar */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${Z_BORDER}`, bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a2b4a' }}>Report Results</Typography>
        <Chip label={`${totalRows} Records`} size="small"
          sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#e8f0fe', color: '#1a65db', fontWeight: 700 }} />
        <Chip label={`Page ${page}`} size="small"
          sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f3f4f6', color: '#6b7280' }} />
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto' }}>
          <LockOutlinedIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>Copy protected · Sort: client-side</Typography>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer
        ref={tableRef}
        sx={{ maxHeight: 380, userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: Z_TH_BG, color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', width: 36, borderRight: `1px solid ${Z_BORDER}` }}>
                #
              </TableCell>
              {cols.map(col => (
                <TableCell key={col.key} onClick={() => handleSort(col.key)}
                  sx={{
                    bgcolor: Z_TH_BG, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                    color: sortCol === col.key ? '#1a65db' : '#374151',
                    borderRight: `1px solid ${Z_BORDER}`,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#dde6f0', color: '#1a65db' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>{col.label}</span>
                    {sortCol === col.key && (
                      sortDir === 'asc'
                        ? <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                        : <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                    )}
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && rows.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={20} /></TableCell>
                    {cols.map(c => <TableCell key={c.key}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
              : sorted.map((row, idx) => (
                  <TableRow key={idx}
                    sx={{
                      '&:nth-of-type(even)': { bgcolor: '#fafbfc' },
                      '&:hover': { bgcolor: Z_ROW_H },
                      cursor: 'default',
                    }}
                  >
                    <TableCell sx={{ color: '#9ca3af', fontSize: '0.72rem', borderRight: `1px solid ${Z_BORDER}` }}>
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    {cols.map(col => (
                      <TableCell key={col.key} sx={{ borderRight: `1px solid ${Z_BORDER}`, color: '#1a2b4a' }}>
                        {fmt(row[col.key], col.label)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            }
            {!isLoading && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols.length + 1} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={0.5}>
                    <WarningAmberIcon sx={{ fontSize: 28, color: '#d1d5db' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af' }}>No records match the current criteria.</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${Z_BORDER}`, bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Showing {Math.min((page - 1) * pageSize + 1, totalRows)}–{Math.min(page * pageSize, totalRows)} of {totalRows} records
        </Typography>
        {hasMore ? (
          <Button size="small" variant="outlined"
            endIcon={isLoading ? <CircularProgress size={12} /> : <NavigateNextIcon />}
            onClick={onNextPage} disabled={isLoading}
            sx={{ fontSize: '0.75rem', borderColor: '#1a65db', color: '#1a65db', px: 1.5, py: 0.25, '&:hover': { bgcolor: '#f0f5ff' } }}>
            Next Page
          </Button>
        ) : totalRows > pageSize ? (
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>All records loaded</Typography>
        ) : null}
      </Box>
    </Paper>
  )
}
