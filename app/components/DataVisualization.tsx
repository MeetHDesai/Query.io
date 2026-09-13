import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

// Table component that displays query results
export const TableDisplay = ({ data, columns, title, description }: { data: any[], columns: string[], title?: string, description?: string }) => (
  <div className="space-y-2">
    {title && <h3 className="text-lg font-medium">{title}</h3>}
    {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}

    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((header: string) => (
              <th key={header} className="p-2 text-left font-medium text-muted-foreground">
                {header.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              {columns.map((col, j) => (
                <td key={j} className="p-2 border-t">{String(row[col] !== null ? row[col] : 'NULL')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm">
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  </div>
);

// Chart component that displays visualizations based on chartType
export const ChartDisplay = ({ data, columns, chartType, title, description }: {
  data: any[],
  columns: string[],
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'radial' | 'table',
  title?: string,
  description?: string
}) => {
  // Determine if we should render a chart or fallback to a placeholder
  const shouldRenderChart = data.length > 0 && columns.length > 0;

  return (
    <div className="space-y-3">
      {title && <h3 className="text-lg font-medium">{title}</h3>}

      <div className="p-4 bg-muted/20 rounded-md h-72 flex flex-col">
        {shouldRenderChart ? (
          <>
            <div className="flex-grow">
              {/* Chart visualization placeholder - in a real app, you would use a charting library like recharts, chart.js, etc. */}
              <div className="w-full h-full flex items-center justify-center bg-primary/5 rounded">
                <div className="text-center">
                  <p className="font-medium mb-2">{chartType.toUpperCase()} Chart</p>
                  <p className="text-sm text-muted-foreground">
                    Displaying {data.length} rows with {columns.length} columns
                  </p>
                </div>
              </div>
            </div>
            {description && (
              <div className="mt-2 text-sm text-muted-foreground">
                {description}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No data available for visualization</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}; 