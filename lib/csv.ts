/**
 * Escapes a CSV cell value by wrapping it in quotes if it contains sensitive characters
 * and escaping internal quotes.
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  
  let strValue = String(value);
  
  // If value contains comma, double quotes, or newline, wrap in quotes
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
    // Escape internal double quotes by doubling them
    strValue = strValue.replace(/"/g, '""');
    return `"${strValue}"`;
  }
  
  return strValue;
}

/**
 * Converts an array of headers and rows into a CSV string.
 */
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const dataRows = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
  
  return `${headerRow}\n${dataRows}`;
}

/**
 * Returns a Next.js Response object configured for CSV download.
 */
export function downloadCsvResponse(filename: string, csvString: string): Response {
  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
