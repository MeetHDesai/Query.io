"use client";

import * as React from 'react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react'; // For error display
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Choose your preferred theme, e.g., atomDark, dracula, materialDark etc.
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    LineChart, Line,
    BarChart as RechartsBarChart, Bar,
    PieChart, Pie, Cell,
    AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    RadialBarChart, RadialBar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// --- Interface matching Backend Response ---
// Make sure this matches the QueryResult interface used in route.ts
export interface QueryResult {
  chartType?: "line" | "bar" | "pie" | "area" | "radar" | "radial" | "table";
  data: any[];
  columns: any[]; // Allow any type for columns to avoid type errors
  sql: string;
  title?: string;
  description?: string;
  error?: string; // Field to receive errors from the backend
}

interface QueryResultProps {
  result: QueryResult;
  // Removed messageId if not needed
}

// --- COLORS constant for Charts ---
// Example palette (customize as needed)
const COLORS = ['#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#818CF8', '#FB923C', '#38BDF8'];

// Helper function to format column names safely
function formatColumnName(column: any): string {
  if (typeof column === 'string') {
    return column.replace(/_/g, ' ');
  }
  return String(column || '');
}

// --- Main Component ---
export const QueryResultComponent = ({ result }: QueryResultProps) => {
  const [activeView, setActiveView] = useState<"table" | "chart">("table");
  const [isCopied, setIsCopied] = useState(false);

  // Handle copying SQL to clipboard
  const copySqlToClipboard = () => {
    if (result.sql) {
      navigator.clipboard.writeText(result.sql.trim());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Determine if chart is possible based on backend response
  const isChartPossible = result.chartType && result.chartType !== 'table' &&
                         result.data && result.data.length > 0 &&
                         result.columns && result.columns.length > 0; // Simplified check, specific checks in renderChart

  // --- Error Display ---
  // If the backend sent an error, display it prominently and stop
  if (result.error) {
      return (
          <Card className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 my-4 text-destructive">
              <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base">Query Error</h3>
              </div>
              <p className="mt-2 text-sm">{result.error}</p>
              {/* Optionally show the SQL that caused the error, if available */}
              {result.sql && (
                  <div className="mt-4">
                      <p className="text-xs font-medium mb-1 text-destructive/80">Attempted SQL:</p>
                      <SyntaxHighlighter
                          language="sql"
                          style={atomDark} // Or your preferred theme
                          customStyle={{
                              background: 'rgba(153, 27, 27, 0.1)', // Faint red background for error SQL
                              border: '1px solid rgba(153, 27, 27, 0.3)',
                              borderRadius: '0.25rem',
                              padding: '0.5rem',
                              fontSize: '0.8rem',
                              overflowX: 'auto',
                              color: 'rgba(220, 38, 38, 0.9)' // Error text color
                          }}
                          wrapLongLines={true}
                          >
                          {result.sql.trim()}
                      </SyntaxHighlighter>
                  </div>
              )}
          </Card>
      );
  }

  // --- Main Component Rendering (No Error) ---
  return (
    <Card className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 my-4 shadow-lg text-zinc-100 overflow-hidden">

      {/* SQL Block with Copy Button */}
      {result.sql && (
        <div className="mb-4 relative">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-medium text-zinc-400">Generated SQL:</p>
              <button 
                onClick={copySqlToClipboard}
                className="text-xs px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <SyntaxHighlighter
                language="sql"
                style={atomDark} // Or your preferred theme
                customStyle={{
                    background: '#18181b', // zinc-900
                    border: '1px solid #3f3f46', // zinc-700
                    borderRadius: '0.375rem',
                    padding: '1rem',
                    fontSize: '0.8rem', // Slightly smaller font size
                    overflowX: 'auto',
                    color: '#d4d4d8' // zinc-300
                }}
                wrapLongLines={true}
            >
                {result.sql.trim()}
            </SyntaxHighlighter>
        </div>
      )}

      {/* Tabs Implementation */}
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as "table" | "chart")}
        className="w-full"
        defaultValue="table"
      >
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800 h-9"> {/* Adjusted height */}
          <TabsTrigger
            value="table"
            className="text-xs sm:text-sm data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 px-2" // Adjusted padding/font size
          >
            Table
          </TabsTrigger>
          <TabsTrigger
            value="chart"
            disabled={!isChartPossible}
            className="text-xs sm:text-sm data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 px-2 disabled:opacity-50 disabled:text-zinc-600" // Adjusted padding/font size
          >
            Chart
          </TabsTrigger>
        </TabsList>

        {/* Table Content Panel */}
        <TabsContent value="table" className="mt-3 sm:mt-4">
          <div className="rounded-md border border-zinc-700 overflow-auto max-h-[400px]"> {/* Max height and scroll */}
            <Table className="min-w-full divide-y divide-zinc-700">
              <TableHeader className="bg-zinc-800 sticky top-0 z-10"> {/* Sticky header */}
                <TableRow className="hover:bg-zinc-800">
                  {result.columns?.map((column, index) => (
                    <TableHead 
                      key={`col-${index}`} 
                      className="px-3 py-2 text-left text-xs sm:text-sm font-medium text-zinc-300 whitespace-nowrap"
                    >
                      {formatColumnName(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-800 bg-zinc-900">
                {(!result.data || result.data.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={result.columns?.length || 1} className="text-center text-zinc-500 py-6 text-sm">
                        No data available for this query.
                      </TableCell>
                    </TableRow>
                 ) : (
                    result.data.map((row, i) => (
                      <TableRow key={`row-${i}`} className="hover:bg-zinc-800/50">
                        {result.columns?.map((column, j) => (
                          <TableCell 
                            key={`cell-${i}-${j}`} 
                            className="px-3 py-2 text-xs sm:text-sm text-zinc-200 whitespace-nowrap"
                          >
                            {/* Display formatting */}
                            {typeof row[column] === 'boolean' ? (row[column] ? 'True' : 'False') :
                             row[column] === null ? <span className="text-zinc-500">NULL</span> :
                             String(row[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                 )}
              </TableBody>
            </Table>
          </div>
          {/* Display description below table */}
          {result.description && (
             <p className="mt-3 text-xs sm:text-sm text-zinc-400 italic">
                {result.description}
             </p>
          )}
        </TabsContent>

        {/* Chart Content Panel */}
        <TabsContent value="chart" className="mt-3 sm:mt-4">
          {isChartPossible ? (
            <div className="h-[400px] sm:h-[450px] w-full flex flex-col bg-zinc-900 p-3 sm:p-4 rounded-lg border border-zinc-800">
               {/* Render title above chart */}
               {result.title && <h3 className="text-sm sm:text-base font-semibold mb-3 text-center text-zinc-100 truncate">{result.title}</h3>}
               <div className="flex-1 min-h-0"> {/* Ensure chart container takes remaining space */}
                  <ResponsiveContainer width="100%" height="100%">
                      {renderChart(result)}
                    </ResponsiveContainer>
               </div>
               {/* Render description below chart */}
               {result.description && (
                 <p className="mt-3 text-xs sm:text-sm text-zinc-400 italic text-center">
                   {result.description}
                 </p>
               )}
            </div>
          ) : (
            // Message shown if chart tab is active but not possible (e.g., chartType='table')
            <div className="flex justify-center items-center h-40 rounded-lg border border-zinc-800 bg-zinc-900">
                 <p className="text-zinc-500 text-sm">Chart not applicable for this result.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};


// --- Updated renderChart Function ---
// (Make sure this function is defined within the same file or imported correctly)
function renderChart(result: QueryResult) {
    // Defensive checks
    if (!result.chartType || !result.data || !result.columns || result.data.length === 0) {
        return <div className="flex items-center justify-center h-full"><p className="text-zinc-500">Insufficient data or configuration for chart.</p></div>;
    }

    const xAxisKey = result.columns[0];
    const primaryValueKey = result.columns.length > 1 ? result.columns[1] : undefined;
    const secondaryValueKeys = result.columns.length > 1 ? result.columns.slice(1) : [];

    // Common Tooltip Styling
    const tooltipContentStyle = {
        backgroundColor: 'rgba(39, 39, 42, 0.9)', // zinc-800 with opacity
        border: '1px solid #52525b', // zinc-600
        borderRadius: '0.375rem',
        color: '#e4e4e7', // zinc-200
        fontSize: '0.75rem', // text-xs
        padding: '0.5rem 0.75rem'
    };
    const tooltipItemStyle = { color: '#e4e4e7' };
    const tooltipLabelStyle = { color: '#a1a1aa', marginBottom: '0.25rem', fontWeight: '500' }; // zinc-400

    // Common Axis/Legend Styling
    const tickStyle = { fill: '#a1a1aa', fontSize: 10 }; // zinc-400, text-xs
    const legendStyle = { color: '#a1a1aa', fontSize: 10, paddingTop: '10px' }; // zinc-400, text-xs

    // Explicit type for formatter to handle potential type issues
    const tooltipFormatter = (value: any, name: any) => [value, formatColumnName(name)];

    switch (result.chartType) {
        case "bar":
            if (!xAxisKey || !primaryValueKey) return <div className="flex items-center justify-center h-full"><p className="text-yellow-500">Bar chart requires at least 2 columns (category, value).</p></div>;
            return (
                <RechartsBarChart data={result.data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}> {/* Adjusted margins */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false}/> {/* zinc-700 */}
                    <XAxis dataKey={xAxisKey} stroke="#a1a1aa" tick={tickStyle} interval="preserveStartEnd" />
                    <YAxis stroke="#a1a1aa" tick={tickStyle} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(161, 161, 170, 0.2)' }} />
                    <Legend wrapperStyle={legendStyle} />
                    {/* Render multiple bars if more than 2 columns are present */}
                    {secondaryValueKeys.map((key, index) => (
                       <Bar key={`key-${index}`} dataKey={key} fill={COLORS[index % COLORS.length]} name={formatColumnName(key)} maxBarSize={50}/>
                    ))}
                </RechartsBarChart>
            );

        case "line":
        case "area": // Area chart uses similar setup to Line
            if (!xAxisKey || secondaryValueKeys.length === 0) return <div className="flex items-center justify-center h-full"><p className="text-yellow-500">Line/Area chart requires at least 2 columns (X-axis, Y-axis).</p></div>;
            const ChartComponent = result.chartType === 'area' ? AreaChart : LineChart;
            const DataComponent = result.chartType === 'area' ? Area : Line;

            return (
                <ChartComponent data={result.data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}> {/* Adjusted margins */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" /> {/* zinc-700 */}
                    <XAxis dataKey={xAxisKey} stroke="#a1a1aa" tick={tickStyle} interval="preserveStartEnd" />
                    <YAxis stroke="#a1a1aa" tick={tickStyle} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ stroke: '#a1a1aa', strokeWidth: 1 }} />
                    <Legend wrapperStyle={legendStyle} />
                    {secondaryValueKeys.map((key, index) => (
                        <DataComponent
                            key={`key-${index}`}
                            type="monotone"
                            dataKey={key}
                            name={formatColumnName(key)}
                            stroke={COLORS[index % COLORS.length]}
                            // Fill for Area chart, none for Line
                            fill={result.chartType === 'area' ? COLORS[index % COLORS.length] : 'none'}
                            fillOpacity={result.chartType === 'area' ? 0.3 : undefined}
                            dot={{ stroke: COLORS[index % COLORS.length], fill: '#18181b', strokeWidth: 1, r: 2 }} // Small dots with dark bg fill
                            activeDot={{ r: 4, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                            strokeWidth={2}
                        />
                    ))}
                </ChartComponent>
            );

        case "pie":
            if (!xAxisKey || !primaryValueKey) return <div className="flex items-center justify-center h-full"><p className="text-yellow-500">Pie chart requires at least 2 columns (name, value).</p></div>;
            return (
                <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}> {/* Allow space for legend */}
                    <Pie
                        data={result.data}
                        cx="50%"
                        cy="45%" // Slightly raise center for legend space
                        labelLine={false}
                        outerRadius="80%"
                        fill="#8884d8" // Default fill, overridden by Cells
                        dataKey={primaryValueKey}
                        nameKey={xAxisKey}
                        label={({ name, percent }) => (percent * 100) >= 3 ? `${(percent * 100).toFixed(0)}%` : ''} // Show % only if > 3%
                        fontSize={10}
                        stroke="#18181b" // Background color for separation
                        strokeWidth={1}
                    >
                        {result.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} formatter={tooltipFormatter}/>
                    <Legend wrapperStyle={legendStyle} />
                </PieChart>
            );

         case "radar":
            if (!xAxisKey || secondaryValueKeys.length < 2 || !primaryValueKey) return <div className="flex items-center justify-center h-full"><p className="text-yellow-500">Radar chart requires at least 3 columns (subject, metric1, metric2...).</p></div>;
             // Radar chart often expects data where each key in an object is a metric for a subject
             // The AI might need to structure SQL to provide this, or we adapt here if possible.
             // Assuming secondaryValueKeys are the axes/metrics and xAxisKey is the subject/group.
             // Recharts RadarChart usually takes metrics as dataKeys within the <Radar /> component.
             // Let's assume the structure is ok for now.
            return (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.data}>
                    <PolarGrid stroke="#3f3f46"/> {/* zinc-700 */}
                    {/* Use the quantitative column names (secondaryValueKeys) as axes */}
                    <PolarAngleAxis dataKey={xAxisKey} stroke="#a1a1aa" tick={tickStyle} /> {/* This might need adjustment depending on data structure */}
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={tickStyle} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    <Legend wrapperStyle={legendStyle}/>
                     {/* This part needs careful data mapping. If data has multiple rows each representing a radar line (subject) */}
                     {/* We might need only one <Radar> if data is aggregated per metric/angle */}
                     {/* OR map secondaryValueKeys if data structure allows */} 
                     <Radar dataKey={primaryValueKey} /* Need to adapt dataKey based on how data is structured for Radar */
                        stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} name={formatColumnName(primaryValueKey)} />
                    {/* Add more <Radar> components if comparing multiple groups/subjects requires it */}
                </RadarChart>
            );

        case "radial":
             if (!xAxisKey || !primaryValueKey) return <div className="flex items-center justify-center h-full"><p className="text-yellow-500">Radial chart requires at least 2 columns (category, value).</p></div>;
             // RadialBarChart often needs specific data formatting. Assuming simple category/value for now.
             // It often works better with a limited number of bars.
             // Calculate domain for the radial axis
             const maxRadialValue = Math.max(...result.data.map(d => d[primaryValueKey] || 0));
            return (
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%" // Adjust gap in the middle
                    outerRadius="80%"
                    barSize={10} // Adjust thickness of bars
                    data={result.data}
                    startAngle={90} // Start from top
                    endAngle={-270} // Go full circle
                >
                    <PolarAngleAxis type="number" domain={[0, maxRadialValue]} tick={false} />
                    <RadialBar
                        // Simplified props to avoid type errors
                        background={{ fill: '#3f3f46' }} // Background track color
                        dataKey={primaryValueKey}
                        // Removed problematic props: clockWise, angleAxisId, minAngle
                    >
                     {result.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </RadialBar>
                    {/* Use Legend to show categories instead of labels */}
                    <Legend iconSize={10} wrapperStyle={legendStyle} layout="vertical" verticalAlign="middle" align="right"
                      payload={result.data.map((entry, index) => ({
                        value: formatColumnName(entry[xAxisKey]),
                        type: 'square',
                        id: entry[xAxisKey],
                        color: COLORS[index % COLORS.length]
                      }))} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                </RadialBarChart>
            );

        default:
             // Handles 'table' or any unknown chart type
            return <div className="flex items-center justify-center h-full"><p className="text-zinc-500">Chart type '{result.chartType}' is not supported or not applicable.</p></div>;
    }
}