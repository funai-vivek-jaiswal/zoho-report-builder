export const MODULES = [
  { api_name: 'Leads', label: 'Leads' },
  { api_name: 'Accounts', label: 'Accounts' },
  { api_name: 'Contacts', label: 'Contacts' },
  { api_name: 'Deals', label: 'Deals' },
]

// Flat field list per module. Lookup fields carry is_lookup + lookup_prefix.
export const FIELDS = {
  Leads: [
    { api_name: 'Last_Name',                    label: 'Last Name',              data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'First_Name',                   label: 'First Name',             data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Email',                        label: 'Email',                  data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Company',                      label: 'Company',                data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Annual_Revenue',               label: 'Annual Revenue',         data_type: 'Number',   is_lookup: false, is_aggregatable: true,  is_groupable: false },
    { api_name: 'Lead_Status',                  label: 'Lead Status',            data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Lead_Source',                  label: 'Lead Source',            data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Rating',                       label: 'Rating',                 data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Created_Time',                 label: 'Created Date',           data_type: 'Date',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Account_Name.Account_Name',    label: 'Account Name',           data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Phone',           label: 'Account Phone',          data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: false, lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Industry',        label: 'Account Industry',       data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Annual_Revenue',  label: 'Account Annual Revenue', data_type: 'Lookup',   is_lookup: true,  is_aggregatable: true,  is_groupable: false, lookup_prefix: 'Account Name' },
  ],
  Accounts: [
    { api_name: 'Account_Name',  label: 'Account Name',   data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Phone',         label: 'Phone',          data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Industry',      label: 'Industry',       data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Annual_Revenue',label: 'Annual Revenue', data_type: 'Number',   is_lookup: false, is_aggregatable: true,  is_groupable: false },
    { api_name: 'Employees',     label: 'Employees',      data_type: 'Number',   is_lookup: false, is_aggregatable: true,  is_groupable: false },
    { api_name: 'Billing_City',  label: 'Billing City',   data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Billing_State', label: 'Billing State',  data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Created_Time',  label: 'Created Date',   data_type: 'Date',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
  ],
  Contacts: [
    { api_name: 'Last_Name',                 label: 'Last Name',        data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'First_Name',                label: 'First Name',       data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Email',                     label: 'Email',            data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Phone',                     label: 'Phone',            data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: false },
    { api_name: 'Lead_Source',               label: 'Lead Source',      data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Created_Time',              label: 'Created Date',     data_type: 'Date',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Account_Name.Account_Name', label: 'Account Name',     data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Industry',     label: 'Account Industry', data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Billing_City', label: 'Account City',     data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
  ],
  Deals: [
    { api_name: 'Deal_Name',                 label: 'Deal Name',          data_type: 'Text',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Amount',                    label: 'Amount',             data_type: 'Number',   is_lookup: false, is_aggregatable: true,  is_groupable: false },
    { api_name: 'Stage',                     label: 'Stage',              data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Closing_Date',              label: 'Close Date',         data_type: 'Date',     is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Probability',               label: 'Probability (%)',    data_type: 'Number',   is_lookup: false, is_aggregatable: true,  is_groupable: false },
    { api_name: 'Lead_Source',               label: 'Lead Source',        data_type: 'PickList', is_lookup: false, is_aggregatable: false, is_groupable: true  },
    { api_name: 'Account_Name.Account_Name', label: 'Account Name',       data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Account_Name.Industry',     label: 'Account Industry',   data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Account Name' },
    { api_name: 'Contact_Name.Last_Name',    label: 'Contact Last Name',  data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: true,  lookup_prefix: 'Contact Name' },
    { api_name: 'Contact_Name.Email',        label: 'Contact Email',      data_type: 'Lookup',   is_lookup: true,  is_aggregatable: false, is_groupable: false, lookup_prefix: 'Contact Name' },
  ],
}

export const PICKLIST_OPTIONS = {
  Lead_Status:  ['Open - Not Contacted', 'Working - Contacted', 'Closed - Converted', 'Closed - Not Converted'],
  Lead_Source:  ['Cold Call', 'Existing Customer', 'Self Generated', 'Employee', 'Partner', 'Web'],
  Rating:       ['Hot', 'Warm', 'Cold'],
  Industry:     ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'],
  Stage:        ['Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'],
}

const SAMPLE_ROWS = [
  { Last_Name: 'Tanaka',    First_Name: 'Hiroshi', Annual_Revenue: 1200000, Lead_Status: 'Open - Not Contacted',  Email: 'h.tanaka@acmejp.co.jp',       Company: 'Acme Japan',    'Account_Name.Account_Name': 'Acme Japan KK',  'Account_Name.Phone': '03-1234-5678', 'Account_Name.Industry': 'Technology',     Lead_Source: 'Web',            Rating: 'Hot',  Created_Time: '2026-01-15' },
  { Last_Name: 'Yamamoto',  First_Name: 'Keiko',   Annual_Revenue: 850000,  Lead_Status: 'Working - Contacted',   Email: 'k.yamamoto@betallc.jp',        Company: 'Beta LLC',      'Account_Name.Account_Name': 'Beta LLC',       'Account_Name.Phone': '06-9876-5432', 'Account_Name.Industry': 'Finance',        Lead_Source: 'Cold Call',      Rating: 'Warm', Created_Time: '2026-01-20' },
  { Last_Name: 'Suzuki',    First_Name: 'Takashi', Annual_Revenue: 2300000, Lead_Status: 'Open - Not Contacted',  Email: 't.suzuki@gammainc.com',        Company: 'Gamma Inc',     'Account_Name.Account_Name': 'Gamma Inc',      'Account_Name.Phone': '045-3333-4444','Account_Name.Industry': 'Manufacturing',   Lead_Source: 'Partner',        Rating: 'Hot',  Created_Time: '2026-02-01' },
  { Last_Name: 'Watanabe',  First_Name: 'Yuki',    Annual_Revenue: 450000,  Lead_Status: 'Open - Not Contacted',  Email: 'y.watanabe@deltacorp.jp',      Company: 'Delta Corp',    'Account_Name.Account_Name': 'Delta Corp',     'Account_Name.Phone': '052-5555-6666','Account_Name.Industry': 'Retail',         Lead_Source: 'Web',            Rating: 'Cold', Created_Time: '2026-02-10' },
  { Last_Name: 'Ito',       First_Name: 'Masato',  Annual_Revenue: 3100000, Lead_Status: 'Working - Contacted',   Email: 'm.ito@epsilontech.co.jp',      Company: 'Epsilon Tech',  'Account_Name.Account_Name': 'Epsilon Tech',   'Account_Name.Phone': '03-7777-8888', 'Account_Name.Industry': 'Technology',     Lead_Source: 'Self Generated', Rating: 'Hot',  Created_Time: '2026-02-14' },
  { Last_Name: 'Kobayashi', First_Name: 'Aiko',    Annual_Revenue: 670000,  Lead_Status: 'Open - Not Contacted',  Email: 'a.kobayashi@zetagroup.jp',     Company: 'Zeta Group',    'Account_Name.Account_Name': 'Zeta Group',     'Account_Name.Phone': '075-2222-3333','Account_Name.Industry': 'Finance',        Lead_Source: 'Employee',       Rating: 'Warm', Created_Time: '2026-03-01' },
  { Last_Name: 'Nakamura',  First_Name: 'Ryo',     Annual_Revenue: 990000,  Lead_Status: 'Closed - Converted',    Email: 'r.nakamura@etainc.com',        Company: 'Eta Inc',       'Account_Name.Account_Name': 'Eta Inc',        'Account_Name.Phone': '011-4444-5555','Account_Name.Industry': 'Healthcare',     Lead_Source: 'Web',            Rating: 'Hot',  Created_Time: '2026-03-05' },
  { Last_Name: 'Kimura',    First_Name: 'Sato',    Annual_Revenue: 1450000, Lead_Status: 'Open - Not Contacted',  Email: 's.kimura@thetallc.jp',         Company: 'Theta LLC',     'Account_Name.Account_Name': 'Theta LLC',      'Account_Name.Phone': '092-6666-7777','Account_Name.Industry': 'Technology',     Lead_Source: 'Cold Call',      Rating: 'Warm', Created_Time: '2026-03-12' },
  { Last_Name: 'Inoue',     First_Name: 'Miho',    Annual_Revenue: 2800000, Lead_Status: 'Working - Contacted',   Email: 'm.inoue@iotacorp.co.jp',       Company: 'Iota Corp',     'Account_Name.Account_Name': 'Iota Corp',      'Account_Name.Phone': '03-8888-9999', 'Account_Name.Industry': 'Manufacturing',   Lead_Source: 'Partner',        Rating: 'Hot',  Created_Time: '2026-03-18' },
  { Last_Name: 'Kato',      First_Name: 'Jiro',    Annual_Revenue: 510000,  Lead_Status: 'Open - Not Contacted',  Email: 'j.kato@kappainc.jp',           Company: 'Kappa Inc',     'Account_Name.Account_Name': 'Kappa Inc',      'Account_Name.Phone': '06-1111-2222', 'Account_Name.Industry': 'Education',      Lead_Source: 'Web',            Rating: 'Cold', Created_Time: '2026-04-01' },
  { Last_Name: 'Yoshida',   First_Name: 'Hana',    Annual_Revenue: 1890000, Lead_Status: 'Open - Not Contacted',  Email: 'h.yoshida@lambdatech.jp',      Company: 'Lambda Tech',   'Account_Name.Account_Name': 'Lambda Tech',    'Account_Name.Phone': '045-7777-8888','Account_Name.Industry': 'Technology',     Lead_Source: 'Self Generated', Rating: 'Hot',  Created_Time: '2026-04-05' },
  { Last_Name: 'Hayashi',   First_Name: 'Kenji',   Annual_Revenue: 720000,  Lead_Status: 'Working - Contacted',   Email: 'k.hayashi@mucorp.co.jp',       Company: 'Mu Corp',       'Account_Name.Account_Name': 'Mu Corp',        'Account_Name.Phone': '052-9999-0000','Account_Name.Industry': 'Finance',        Lead_Source: 'Cold Call',      Rating: 'Warm', Created_Time: '2026-04-10' },
  { Last_Name: 'Nishimura', First_Name: 'Toru',    Annual_Revenue: 3400000, Lead_Status: 'Open - Not Contacted',  Email: 't.nishimura@nucorp.co.jp',     Company: 'Nu Corp',       'Account_Name.Account_Name': 'Nu Corp',        'Account_Name.Phone': '03-2222-3333', 'Account_Name.Industry': 'Technology',     Lead_Source: 'Web',            Rating: 'Hot',  Created_Time: '2026-04-15' },
  { Last_Name: 'Fujita',    First_Name: 'Sayuri',  Annual_Revenue: 620000,  Lead_Status: 'Closed - Not Converted',Email: 's.fujita@xicorp.jp',           Company: 'Xi Corp',       'Account_Name.Account_Name': 'Xi Corp',        'Account_Name.Phone': '06-4444-5555', 'Account_Name.Industry': 'Retail',         Lead_Source: 'Partner',        Rating: 'Cold', Created_Time: '2026-04-20' },
  { Last_Name: 'Matsumoto', First_Name: 'Daisuke', Annual_Revenue: 1750000, Lead_Status: 'Working - Contacted',   Email: 'd.matsumoto@omicronllc.co.jp', Company: 'Omicron LLC',   'Account_Name.Account_Name': 'Omicron LLC',    'Account_Name.Phone': '075-8888-9999','Account_Name.Industry': 'Healthcare',     Lead_Source: 'Employee',       Rating: 'Warm', Created_Time: '2026-04-25' },
]

export function generateMockResults(config) {
  const { select_fields = [], filters = [], aggregations = [], group_by = [], page = 1, page_size = 10 } = config

  // Apply filters
  let rows = SAMPLE_ROWS.filter(row => {
    return filters.every(f => {
      if (!f.field || !f.value) return true
      const val = row[f.field]
      if (val === undefined) return true
      switch (f.operator) {
        case '=':           return String(val) === String(f.value)
        case '!=':          return String(val) !== String(f.value)
        case 'contains':    return String(val).toLowerCase().includes(String(f.value).toLowerCase())
        case 'starts with': return String(val).toLowerCase().startsWith(String(f.value).toLowerCase())
        case '>':           return Number(val) > Number(f.value)
        case '<':           return Number(val) < Number(f.value)
        case '>=':          return Number(val) >= Number(f.value)
        case '<=':          return Number(val) <= Number(f.value)
        default:            return true
      }
    })
  })

  // Apply aggregation with group by
  if (aggregations.length > 0 && group_by.length > 0) {
    const groupField = group_by[0].field
    const groups = {}
    rows.forEach(row => {
      const key = row[groupField] ?? 'Unknown'
      if (!groups[key]) {
        groups[key] = { [groupField]: key, _count: 0 }
        aggregations.forEach(a => { groups[key][a.alias || a.field] = a.function === 'MIN' ? Infinity : 0 })
      }
      groups[key]._count++
      aggregations.forEach(a => {
        const v = parseFloat(row[a.field]) || 0
        const k = a.alias || a.field
        switch (a.function) {
          case 'SUM':   groups[key][k] += v; break
          case 'COUNT': groups[key][k] = groups[key]._count; break
          case 'MAX':   groups[key][k] = Math.max(groups[key][k], v); break
          case 'MIN':   groups[key][k] = Math.min(groups[key][k] === Infinity ? v : groups[key][k], v); break
          case 'AVG': {
            groups[key][`__sum_${a.field}`] = (groups[key][`__sum_${a.field}`] || 0) + v
            groups[key][k] = Math.round(groups[key][`__sum_${a.field}`] / groups[key]._count)
            break
          }
        }
      })
    })
    const aggRows = Object.values(groups)
    const start = (page - 1) * page_size
    return { rows: aggRows.slice(start, start + page_size), total: aggRows.length }
  }

  // Project selected fields
  const fieldKeys = select_fields.map(f => f.api_name)
  const projected = fieldKeys.length > 0
    ? rows.map(r => Object.fromEntries(fieldKeys.map(k => [k, r[k] ?? '—'])))
    : rows

  const start = (page - 1) * page_size
  return { rows: projected.slice(start, start + page_size), total: projected.length }
}

export const INITIAL_PRESETS = [
  {
    id: 'p1',
    name: 'Open Leads by Account',
    primary_module: 'Leads',
    is_owner: true,
    shared_with: [],
    config: {
      primary_module: 'Leads',
      select_fields: [
        { api_name: 'Last_Name',                 label: 'Last Name',        data_type: 'Text',     is_lookup: false },
        { api_name: 'Lead_Status',               label: 'Lead Status',      data_type: 'PickList', is_lookup: false },
        { api_name: 'Account_Name.Account_Name', label: 'Account Name',     data_type: 'Lookup',   is_lookup: true  },
        { api_name: 'Annual_Revenue',            label: 'Annual Revenue',   data_type: 'Number',   is_lookup: false },
      ],
      filters: [{ id: 'f1', field: 'Lead_Status', operator: '=', value: 'Open - Not Contacted' }],
      aggregations: [], group_by: [], page: 1, page_size: 10,
    },
  },
  {
    id: 'p2',
    name: 'Revenue by Account (SUM)',
    primary_module: 'Leads',
    is_owner: true,
    shared_with: [],
    config: {
      primary_module: 'Leads',
      select_fields: [
        { api_name: 'Account_Name.Account_Name', label: 'Account Name',   data_type: 'Lookup', is_lookup: true  },
        { api_name: 'Annual_Revenue',            label: 'Annual Revenue', data_type: 'Number', is_lookup: false },
      ],
      filters: [],
      aggregations: [{ id: 'a1', function: 'SUM', field: 'Annual_Revenue', alias: 'Total_Revenue' }],
      group_by: [{ field: 'Account_Name.Account_Name', is_lookup: true }],
      page: 1, page_size: 10,
    },
  },
  {
    id: 'p3',
    name: 'Hot Leads Pipeline',
    primary_module: 'Leads',
    is_owner: false,
    shared_with: ['Yamamoto Keiko'],
    config: {
      primary_module: 'Leads',
      select_fields: [
        { api_name: 'Last_Name',                label: 'Last Name',          data_type: 'Text',     is_lookup: false },
        { api_name: 'Rating',                   label: 'Rating',             data_type: 'PickList', is_lookup: false },
        { api_name: 'Account_Name.Industry',    label: 'Account Industry',   data_type: 'Lookup',   is_lookup: true  },
        { api_name: 'Annual_Revenue',           label: 'Annual Revenue',     data_type: 'Number',   is_lookup: false },
      ],
      filters: [{ id: 'f2', field: 'Rating', operator: '=', value: 'Hot' }],
      aggregations: [], group_by: [], page: 1, page_size: 10,
    },
  },
]
