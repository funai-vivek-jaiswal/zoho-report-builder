import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Stack, Typography, Button, Alert, CircularProgress,
  Divider, Chip, Tooltip, createTheme, ThemeProvider, CssBaseline,
  Avatar, IconButton, InputBase, Badge,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SettingsIcon from '@mui/icons-material/Settings'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import LockIcon from '@mui/icons-material/Lock'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import BarChartIcon from '@mui/icons-material/BarChart'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import AppsIcon from '@mui/icons-material/Apps'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import { MODULES, FIELDS, generateMockResults, INITIAL_PRESETS } from './mockData.js'
import PresetList from './components/PresetList.jsx'
import ModuleSelector from './components/ModuleSelector.jsx'
import FieldPicker from './components/FieldPicker.jsx'
import FilterBuilder from './components/FilterBuilder.jsx'
import AggregationPanel from './components/AggregationPanel.jsx'
import ResultTable from './components/ResultTable.jsx'
import SaveDialog from './components/SaveDialog.jsx'

// ─── Zoho CRM exact palette ───────────────────────────────────────────────────
const Z_DARK   = '#1a2b4a'      // top bar + left nav
const Z_DARK2  = '#243655'      // nav hover
const Z_ACTIVE = '#2e4a7a'      // nav active item bg
const Z_BLUE   = '#1a65db'      // links, secondary buttons
const Z_ORANGE = '#e8442d'      // primary CTA (Generate Report)
const Z_BG     = '#f5f6f8'      // page background
const Z_BORDER = '#dde3e8'      // card/table borders
const Z_TH_BG  = '#edf1f5'      // table header bg
const Z_ROW_H  = '#f0f5ff'      // table row hover

const theme = createTheme({
  typography: {
    fontFamily: '"Lato", "Inter", "Roboto", sans-serif',
    fontSize: 13,
  },
  palette: {
    primary:    { main: Z_BLUE },
    secondary:  { main: Z_ORANGE },
    background: { default: Z_BG, paper: '#ffffff' },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', borderRadius: 3 },
        containedSecondary: { color: '#fff' },
      },
    },
    MuiPaper:    { styleOverrides: { outlined: { border: `1px solid ${Z_BORDER}` } } },
    MuiChip:     { styleOverrides: { root: { fontWeight: 600, fontSize: '0.68rem', borderRadius: 2 } } },
    MuiSelect:   { styleOverrides: { select: { fontSize: '0.82rem' } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: '0.82rem' } } },
    MuiTableCell:{ styleOverrides: { root: { fontSize: '0.82rem', padding: '6px 12px', borderColor: Z_BORDER } } },
    MuiInputBase:{ styleOverrides: { input: { fontSize: '0.82rem' } } },
  },
})

// ─── Zoho Left Nav module items ───────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: <HomeOutlinedIcon sx={{ fontSize: 19 }} />,            label: 'Home' },
  { icon: <PersonOutlineIcon sx={{ fontSize: 19 }} />,           label: 'Leads' },
  { icon: <BusinessIcon sx={{ fontSize: 19 }} />,                label: 'Accounts' },
  { icon: <PeopleOutlineIcon sx={{ fontSize: 19 }} />,           label: 'Contacts' },
  { icon: <AttachMoneyIcon sx={{ fontSize: 19 }} />,             label: 'Deals' },
  { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 19 }} />,   label: 'Activities' },
  { icon: <EmailOutlinedIcon sx={{ fontSize: 19 }} />,           label: 'Emails' },
  { icon: <InventoryOutlinedIcon sx={{ fontSize: 19 }} />,       label: 'Products' },
  { icon: <BarChartIcon sx={{ fontSize: 19 }} />,                label: 'Reports' },
  { icon: <QueryStatsIcon sx={{ fontSize: 19 }} />,              label: 'Analytics' },
]

const EMPTY_CONFIG = {
  primary_module: '', select_fields: [], filters: [],
  aggregations: [], group_by: [], page: 1, page_size: 10,
}

export default function App() {
  const [config, setConfig]         = useState(EMPTY_CONFIG)
  const [availableFields, setAF]    = useState([])
  const [reportData, setReportData] = useState(null)
  const [totalRows, setTotalRows]   = useState(0)
  const [isLoading, setIsLoading]   = useState(false)
  const [isStale, setIsStale]       = useState(false)
  const [error, setError]           = useState(null)
  const [presets, setPresets]       = useState(INITIAL_PRESETS)
  const [saveOpen, setSaveOpen]     = useState(false)
  const [activePresetId, setActivePreset] = useState(null)
  const hasRun = useRef(false)

  // Copy prevention
  useEffect(() => {
    const block = e => e.preventDefault()
    document.addEventListener('contextmenu', block)
    document.addEventListener('copy', block)
    document.addEventListener('cut', block)
    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('copy', block)
      document.removeEventListener('cut', block)
    }
  }, [])

  useEffect(() => {
    setAF(config.primary_module ? (FIELDS[config.primary_module] || []) : [])
  }, [config.primary_module])

  const updateConfig = useCallback((patch) => {
    setConfig(prev => {
      if (hasRun.current) setIsStale(true)
      return { ...prev, ...patch }
    })
  }, [])

  const handleModuleChange = useCallback((mod) => {
    setConfig({ ...EMPTY_CONFIG, primary_module: mod })
    setReportData(null); setError(null); setIsStale(false)
    hasRun.current = false; setActivePreset(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!config.primary_module || config.select_fields.length === 0) return
    setIsLoading(true); setError(null); setIsStale(false); hasRun.current = true
    await new Promise(r => setTimeout(r, 900))
    try {
      const r = generateMockResults({ ...config, page: 1 })
      setReportData(r.rows); setTotalRows(r.total); updateConfig({ page: 1 })
    } catch {
      setError('Report execution failed. Check your configuration.')
    } finally { setIsLoading(false) }
  }, [config, updateConfig])

  const handleNextPage = useCallback(async () => {
    const nextPage = config.page + 1
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const r = generateMockResults({ ...config, page: nextPage })
    setReportData(r.rows); setTotalRows(r.total); updateConfig({ page: nextPage })
    setIsLoading(false)
  }, [config, updateConfig])

  const handleLoadPreset = useCallback((p) => {
    setConfig({ ...p.config }); setReportData(null)
    setIsStale(false); setError(null); hasRun.current = false; setActivePreset(p.id)
  }, [])

  const handleSave = useCallback((name) => {
    const ex = presets.find(p => p.name === name && p.is_owner)
    if (ex) {
      setPresets(prev => prev.map(p => p.id === ex.id ? { ...p, config: { ...config }, primary_module: config.primary_module } : p))
      setActivePreset(ex.id)
    } else {
      const np = { id: `p${Date.now()}`, name, primary_module: config.primary_module, is_owner: true, shared_with: [], config: { ...config } }
      setPresets(prev => [np, ...prev]); setActivePreset(np.id)
    }
    setSaveOpen(false)
  }, [config, presets])

  const canRun = config.primary_module && config.select_fields.length > 0

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── Zoho CRM Top Header ── */}
        <Box sx={{
          bgcolor: Z_DARK, color: '#fff', height: 48, flexShrink: 0,
          display: 'flex', alignItems: 'center', px: 0, zIndex: 200,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Logo area */}
          <Box sx={{ width: 220, display: 'flex', alignItems: 'center', px: 2, gap: 1.5, borderRight: '1px solid rgba(255,255,255,0.1)', height: '100%', flexShrink: 0 }}>
            <Box sx={{
              width: 26, height: 26, bgcolor: '#e8442d', borderRadius: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.95rem', color: '#fff', fontFamily: 'Georgia, serif',
            }}>Z</Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.1, letterSpacing: 0.3 }}>
                ZOHO CRM
              </Typography>
            </Box>
            <AppsIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', ml: 'auto', cursor: 'pointer' }} />
          </Box>

          {/* Search */}
          <Box sx={{ flex: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 1, px: 1.5, py: 0.5, gap: 1, width: 320,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <SearchIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
              <InputBase
                placeholder="Search records, modules…"
                sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', flex: 1,
                  '::placeholder': { color: 'rgba(255,255,255,0.4)' } }}
              />
            </Box>
          </Box>

          {/* Right icons */}
          <Stack direction="row" alignItems="center" spacing={0.5} px={2}>
            <Tooltip title="Create new record" arrow>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: Z_DARK2 } }}>
                <AddIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications" arrow>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: Z_DARK2 } }}>
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 14, height: 14 } }}>
                  <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings" arrow>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: Z_DARK2 } }}>
                <SettingsIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1, pl: 1.5, borderLeft: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#1a65db', fontSize: '0.75rem', fontWeight: 700 }}>VJ</Avatar>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>Vivek</Typography>
              <ArrowDropDownIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
            </Stack>
          </Stack>
        </Box>

        {/* ── Body: left nav + preset panel + main ── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── Left module navigation ── */}
          <Box sx={{
            width: 220, flexShrink: 0, bgcolor: Z_DARK, color: '#fff',
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>
            {NAV_ITEMS.map((item, i) => {
              const isActive = item.label === 'Reports'
              return (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2.5, py: 1.1, cursor: 'pointer',
                  bgcolor: isActive ? Z_ACTIVE : 'transparent',
                  borderLeft: isActive ? '3px solid #e8442d' : '3px solid transparent',
                  '&:hover': { bgcolor: isActive ? Z_ACTIVE : Z_DARK2 },
                  transition: 'background 0.15s',
                }}>
                  <Box sx={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                    {item.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* ── Preset list panel ── */}
          <Box sx={{ width: 230, flexShrink: 0, bgcolor: '#fff', borderRight: `1px solid ${Z_BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PresetList
              presets={presets}
              activePresetId={activePresetId}
              onLoad={handleLoadPreset}
              onDelete={id => { setPresets(p => p.filter(x => x.id !== id)); if (activePresetId === id) setActivePreset(null) }}
              onNew={() => { setConfig(EMPTY_CONFIG); setReportData(null); setActivePreset(null); setError(null); hasRun.current = false }}
            />
          </Box>

          {/* ── Main content: builder + results ── */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: Z_BG }}>

            {/* Page title bar */}
            <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${Z_BORDER}`, px: 3, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>Reports</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>›</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2b4a' }}>Custom Report Builder</Typography>
                <Chip label="PROTOTYPE" size="small"
                  sx={{ bgcolor: '#fff3cd', color: '#856404', border: '1px solid #ffc107', height: 18, fontSize: '0.6rem', fontWeight: 700 }} />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <LockIcon sx={{ fontSize: 12, color: '#999' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#999' }}>Copy protection active</Typography>
              </Stack>
            </Box>

            {/* Builder area */}
            <Box sx={{ flex: reportData ? '0 0 auto' : '1 1 auto', overflowY: 'auto', p: 2 }}>
              <ModuleSelector modules={MODULES} value={config.primary_module} onChange={handleModuleChange} />

              {config.primary_module && (
                <Stack spacing={1.5} mt={1.5}>
                  <FieldPicker
                    fields={availableFields}
                    selected={config.select_fields}
                    onChange={fields => updateConfig({ select_fields: fields })}
                  />
                  <FilterBuilder
                    fields={availableFields.filter(f => !f.is_lookup)}
                    filters={config.filters}
                    onChange={filters => updateConfig({ filters })}
                  />
                  <AggregationPanel
                    fields={availableFields}
                    aggregations={config.aggregations}
                    groupBy={config.group_by}
                    onChangeAgg={agg => updateConfig({ aggregations: agg })}
                    onChangeGroupBy={gb => updateConfig({ group_by: gb })}
                  />
                </Stack>
              )}

              {config.primary_module && (
                <Stack direction="row" spacing={1.5} mt={2} alignItems="center">
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    startIcon={isLoading ? <CircularProgress size={15} sx={{ color: '#fff' }} /> : <PlayArrowRoundedIcon />}
                    onClick={handleGenerate}
                    disabled={!canRun || isLoading}
                    sx={{ px: 2.5, bgcolor: Z_ORANGE, '&:hover': { bgcolor: '#c73520' }, '&:disabled': { bgcolor: '#e8a090', color: '#fff' } }}
                  >
                    {isLoading ? 'Running…' : 'Generate Report'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<SaveRoundedIcon />}
                    onClick={() => setSaveOpen(true)}
                    disabled={!canRun}
                    sx={{ borderColor: Z_BLUE, color: Z_BLUE, '&:hover': { borderColor: Z_BLUE, bgcolor: '#f0f5ff' } }}
                  >
                    Save Preset
                  </Button>
                  {config.select_fields.length === 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                      Select at least one field to enable the report
                    </Typography>
                  )}
                </Stack>
              )}

              {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 1.5, fontSize: '0.82rem' }}>{error}</Alert>}
            </Box>

            {/* Empty state */}
            {!config.primary_module && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                <BarChartIcon sx={{ fontSize: 48, color: '#c5ccd6' }} />
                <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.95rem' }}>Select a module to start building</Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem' }}>Or load a saved preset from the left panel</Typography>
              </Box>
            )}

            {/* Results area */}
            {reportData !== null && (
              <>
                <Divider />
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                  {isStale && (
                    <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.82rem' }} icon={false}>
                      Configuration changed — click <strong>Generate Report</strong> to refresh results.
                    </Alert>
                  )}
                  <ResultTable
                    rows={reportData}
                    columns={config.select_fields}
                    aggregations={config.aggregations}
                    isLoading={isLoading}
                    page={config.page}
                    totalRows={totalRows}
                    pageSize={config.page_size}
                    onNextPage={handleNextPage}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <SaveDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
        existingNames={presets.filter(p => p.is_owner).map(p => p.name)}
      />
    </ThemeProvider>
  )
}
