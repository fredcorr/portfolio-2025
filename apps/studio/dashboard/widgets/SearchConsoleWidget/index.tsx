'use client'

import { DashboardWidgetContainer } from '@sanity/dashboard'
import { Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { type CSSProperties, useCallback, useEffect, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { AsyncState, GSCData, GSCQueryRow, GSCTrendPoint } from './types'
import { GSC_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL, fetchGSCData } from './utils'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Card border radius={2} padding={3} flex={1}>
    <Stack gap={2}>
      <Text size={1} muted weight="semibold">
        {label}
      </Text>
      <Text size={3} weight="bold">
        {value}
      </Text>
    </Stack>
  </Card>
)

const ClickTrendChart = ({ points }: { points: GSCTrendPoint[] }) => {
  if (points.length < 2) return null

  // Show abbreviated date labels (e.g. "Jul 1") — every ~7th tick to avoid crowding
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  }

  return (
    <Box>
      <Text size={1} muted style={{ display: 'block', marginBottom: 8 }}>
        Click trend (28 days)
      </Text>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Clicks']}
            labelFormatter={formatDate}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#2276FC"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

const QueryTable = ({ rows }: { rows: GSCQueryRow[] }) => {
  type Col = { label: string; key: keyof GSCQueryRow; align: 'left' | 'right' }

  const cols: Col[] = [
    { label: 'Query', key: 'query', align: 'left' },
    { label: 'Clicks', key: 'clicks', align: 'right' },
    { label: 'Impressions', key: 'impressions', align: 'right' },
    { label: 'CTR', key: 'ctr', align: 'right' },
    { label: 'Pos', key: 'position', align: 'right' },
  ]

  const fmt = (key: keyof GSCQueryRow, v: string | number): string => {
    if (key === 'ctr') return `${((v as number) * 100).toFixed(1)}%`
    if (key === 'position') return (v as number).toFixed(1)
    if (typeof v === 'number') return v.toLocaleString()
    return v
  }

  const cellStyle = (key: keyof GSCQueryRow): CSSProperties => ({
    padding: '4px 8px',
    borderBottom: '1px solid var(--card-border-color)',
    textAlign: key === 'query' ? 'left' : 'right',
    ...(key === 'query'
      ? { maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : {}),
  })

  return (
    <Box style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={cellStyle(c.key)}>
                <Text size={1} muted weight="semibold">
                  {c.label}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.query}>
              {cols.map(c => (
                <td key={c.key} style={cellStyle(c.key)}>
                  <Text size={1}>{fmt(c.key, row[c.key])}</Text>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

export const SearchConsoleWidget = () => {
  const [state, setState] = useState<AsyncState<GSCData>>({ status: 'idle' })

  const load = useCallback(() => {
    if (!GSC_EMAIL || !GSC_PRIVATE_KEY || !GSC_SITE_URL) {
      setState({
        status: 'error',
        message:
          'Set SANITY_STUDIO_GSC_SERVICE_ACCOUNT_EMAIL, SANITY_STUDIO_GSC_PRIVATE_KEY and SANITY_STUDIO_GSC_SITE_URL in your studio .env file.',
      })
      return
    }
    setState({ status: 'loading' })
    fetchGSCData()
      .then(data => setState({ status: 'success', data }))
      .catch((err: unknown) =>
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
      )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const period =
    state.status === 'success'
      ? ` — ${state.data.period.startDate} to ${state.data.period.endDate}`
      : ''

  return (
    <DashboardWidgetContainer
      header={`Search Console${period}`}
      footer={
        <Flex justify="flex-end" padding={2}>
          <Button
            fontSize={1}
            mode="ghost"
            onClick={load}
            padding={2}
            text="Refresh"
          />
        </Flex>
      }
    >
      {(state.status === 'idle' || state.status === 'loading') && (
        <Flex align="center" justify="center" padding={6}>
          <Spinner />
        </Flex>
      )}
      {state.status === 'error' && (
        <Box padding={4}>
          <Text size={1} muted>
            {state.message}
          </Text>
        </Box>
      )}
      {state.status === 'success' && (
        <Stack gap={4} padding={3}>
          <Flex gap={2}>
            <StatCard label="Clicks" value={state.data.totals.clicks.toLocaleString()} />
            <StatCard
              label="Impressions"
              value={state.data.totals.impressions.toLocaleString()}
            />
            <StatCard
              label="CTR"
              value={`${(state.data.totals.ctr * 100).toFixed(1)}%`}
            />
            <StatCard
              label="Avg Position"
              value={state.data.totals.position.toFixed(1)}
            />
          </Flex>
          <ClickTrendChart points={state.data.clickTrend} />
          <QueryTable rows={state.data.topQueries} />
        </Stack>
      )}
    </DashboardWidgetContainer>
  )
}
