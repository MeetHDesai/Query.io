import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Define component props
interface QueryResultViewerProps {
  sql: string;
  data: any[];
  columns: string[];
  chartMeta?: {
    type: 'line' | 'bar';
    xKey?: string;
    seriesKey?: string;
    valueKey?: string;
  };
  summary?: string;
  title?: string;
}

// Define a color palette for charts
const CHART_COLORS = [
  '#A78BFA', // purple
  '#60A5FA', // blue
  '#34D399', // green
  '#FBBF24', // yellow
  '#F87171', // red
  '#818CF8', // indigo
  '#FB923C', // orange
  '#38BDF8'  // light blue
];

export function QueryResultViewer({ 
  sql, 
  data, 
  columns, 
  chartMeta, 
  summary, 
  title
}: QueryResultViewerProps) {
  const [activeView, setActiveView] = useState<"table" | "chart">("table");
  const [isCopied, setIsCopied] = useState(false);
  
  // Handle SQL copy operation
  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Check if chart is possible
  const isChartPossible = useMemo(() => {
    return chartMeta && data && data.length > 0 && columns.length > 2;
  }, [chartMeta, data, columns]);

  // Format column names to be more readable
  const formatColumnName = (column: string): string => {
    return column.replace(/_/g, ' ');
  };

  // Prepare chart data
  const prepareChartData = useMemo(() => {
    // Set default keys if not provided
    const xKey = chartMeta?.xKey || columns[0];
    const valueKey = chartMeta?.valueKey || columns[1];
    const seriesKey = chartMeta?.seriesKey;

    // If we have a series key, group by that key
    if (seriesKey && data && data.length > 0) {
      // Group by X value and series
      const groupedData = data.reduce((acc, row) => {
        const xValue = row[xKey];
        const seriesValue = row[seriesKey];
        const value = row[valueKey];
        
        if (!acc[xValue]) {
          acc[xValue] = { [xKey]: xValue };
        }
        
        acc[xValue][seriesValue] = value;
        return acc;
      }, {});
      
      // Convert back to array
      return Object.values(groupedData);
    }
    
    // No series key - return the data directly
    return data;
  }, [data, columns, chartMeta]);

  // Get series for chart (columns to draw as lines/bars)
  const chartSeries = useMemo(() => {
    if (!chartMeta) return [];
    
    const xKey = chartMeta.xKey || columns[0];
    const seriesKey = chartMeta.seriesKey;
    
    // If we have a seriesKey, extract unique series values
    if (seriesKey) {
      return [...new Set(data.map(row => row[seriesKey]))];
    }
    
    // Otherwise use all columns except the xKey
    return columns.filter(col => col !== xKey);
  }, [data, columns, chartMeta]);

  // Render the appropriate chart based on chartMeta
  const renderChart = () => {
    if (!chartMeta || !isChartPossible) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500 text-sm">Chart not available for this data.</p>
        </div>
      );
    }
    
    const xKey = chartMeta.xKey || columns[0];
    
    switch (chartMeta.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prepareChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis 
                dataKey={xKey} 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                stroke="#52525b" 
              />
              <YAxis 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                stroke="#52525b" 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '0.375rem',
                  color: '#e4e4e7',
                  fontSize: '0.75rem'
                }} 
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px', 
                  fontSize: '0.75rem', 
                  color: '#a1a1aa' 
                }} 
              />
              {chartSeries.map((series, index) => (
                <Line
                  key={`line-${series}`}
                  type="monotone"
                  dataKey={series}
                  name={formatColumnName(series)}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  dot={{ stroke: CHART_COLORS[index % CHART_COLORS.length], fill: '#18181b', r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis 
                dataKey={xKey} 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                stroke="#52525b" 
              />
              <YAxis 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                stroke="#52525b" 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '0.375rem',
                  color: '#e4e4e7',
                  fontSize: '0.75rem'
                }} 
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px', 
                  fontSize: '0.75rem', 
                  color: '#a1a1aa' 
                }} 
              />
              {chartSeries.map((series, index) => (
                <Bar
                  key={`bar-${series}`}
                  dataKey={series}
                  name={formatColumnName(series)}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">Unsupported chart type.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Title & Summary Section */}
      {(title || summary) && (
        <div className="space-y-1">
          {title && (
            <h3 className="font-semibold text-base text-white">
              {title}
            </h3>
          )}
          {activeView === "table" && summary && (
            <p className="text-sm text-gray-300">
              {summary}
            </p>
          )}
        </div>
      )}

      {/* SQL Query Block */}
      {sql && (
        <div className="relative rounded-md overflow-hidden">
          <div className="flex justify-between items-center px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
            <span className="text-xs font-medium text-zinc-400">SQL Query</span>
            <button 
              onClick={copySqlToClipboard}
              className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <SyntaxHighlighter
            language="sql"
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '12px',
              fontSize: '0.8rem',
              background: '#18181b',
              borderRadius: '0 0 6px 6px'
            }}
          >
            {sql}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Table/Chart Toggle */}
      <Tabs 
        value={activeView} 
        onValueChange={(value) => setActiveView(value as "table" | "chart")} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800 h-9">
          <TabsTrigger
            value="table"
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
          >
            Table
          </TabsTrigger>
          <TabsTrigger
            value="chart"
            disabled={!isChartPossible}
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 disabled:opacity-50"
          >
            Chart
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="mt-3">
          <div className="rounded-md border border-zinc-700 overflow-auto max-h-[400px]">
            <Table className="w-full">
              <TableHeader className="bg-zinc-800 sticky top-0 z-10">
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead 
                      key={`col-${index}`}
                      className="px-3 py-2 text-left text-xs font-medium text-zinc-300 whitespace-nowrap"
                    >
                      {formatColumnName(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-800 bg-zinc-900">
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-zinc-500 py-6 text-sm">
                      No data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`} className="hover:bg-zinc-800/50">
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={`cell-${rowIndex}-${colIndex}`}
                          className="px-3 py-2 text-xs text-zinc-200 whitespace-nowrap"
                        >
                          {row[column] === null ? (
                            <span className="text-zinc-500">NULL</span>
                          ) : (
                            String(row[column])
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Chart View */}
        <TabsContent value="chart" className="mt-3">
          <Card className="bg-zinc-900 border-zinc-800 p-4 rounded-md">
            <div className="h-[350px] w-full flex flex-col">
              {/* Show summary only in chart view */}
              {summary && (
                <p className="text-sm text-zinc-400 mb-3 text-center">
                  {summary}
                </p>
              )}
              <div className="flex-1 min-h-0">
                {renderChart()}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 