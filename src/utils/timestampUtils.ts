import { Edge } from '@/types/graph.types';
import { TimestampFieldInfo } from '@/types/timeFiltering.types';

// Common timestamp field names to check
const TIMESTAMP_FIELD_PATTERNS = [
  'timestamp',
  'time',
  'date',
  'datetime',
  'created',
  'created_at',
  'createdAt',
  'updated',
  'updated_at',
  'updatedAt',
  'modified',
  'modified_at',
  'modifiedAt',
  'occurred',
  'occurred_at',
  'occurredAt',
  'event_time',
  'eventTime',
  'start',
  'end',
  'startTime',
  'endTime',
  'when'
];

/**
 * Parse a value into a timestamp (milliseconds since epoch)
 */
export function parseTimestamp(value: unknown): number | null {
  if (!value) return null;
  
  // Already a number (assume Unix timestamp)
  if (typeof value === 'number') {
    // Check if it's in seconds (10 digits) or milliseconds (13 digits)
    if (value > 1000000000 && value < 10000000000) {
      return value * 1000; // Convert seconds to milliseconds
    }
    if (value > 1000000000000 && value < 10000000000000) {
      return value; // Already in milliseconds
    }
    return null; // Invalid timestamp
  }
  
  // String timestamp
  if (typeof value === 'string') {
    // Try parsing as ISO date or other standard formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
    
    // Try parsing as Unix timestamp string
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return parseTimestamp(numValue);
    }
  }
  
  return null;
}

/**
 * Detect potential timestamp fields in an object
 */
export function detectTimestampFields(obj: Record<string, unknown>): string[] {
  const timestampFields: string[] = [];
  
  // Check top-level fields
  for (const field of Object.keys(obj)) {
    const lowerField = field.toLowerCase();
    
    // Check if field name matches common patterns
    if (TIMESTAMP_FIELD_PATTERNS.some(pattern => lowerField.includes(pattern))) {
      const value = obj[field];
      const parsed = parseTimestamp(value);
      if (parsed !== null) {
        timestampFields.push(field);
      }
    }
  }
  
  // Check nested attributes/properties
  const nestedObjects = ['attributes', 'properties', 'data', 'metadata'];
  for (const nested of nestedObjects) {
    if (obj[nested] && typeof obj[nested] === 'object') {
      const nestedObj = obj[nested] as Record<string, unknown>;
      for (const field of Object.keys(nestedObj)) {
        const lowerField = field.toLowerCase();
        if (TIMESTAMP_FIELD_PATTERNS.some(pattern => lowerField.includes(pattern))) {
          const value = nestedObj[field];
          const parsed = parseTimestamp(value);
          if (parsed !== null) {
            timestampFields.push(`${nested}.${field}`);
          }
        }
      }
    }
  }
  
  return timestampFields;
}

/**
 * Get value from nested path (e.g., "attributes.created_at")
 */
function getNestedValue(obj: any, path: string): unknown {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Analyze timestamp fields in edges to find the best one
 */
export function analyzeTimestampFields(edges: Edge[]): TimestampFieldInfo[] {
  if (!edges.length) return [];
  
  // Get all potential fields from first few edges
  const sampleSize = Math.min(10, edges.length);
  const potentialFields = new Set<string>();
  
  for (let i = 0; i < sampleSize; i++) {
    const fields = detectTimestampFields(edges[i] as any);
    fields.forEach(f => potentialFields.add(f));
  }
  
  // Analyze each field
  const fieldInfo: TimestampFieldInfo[] = [];
  
  for (const field of potentialFields) {
    let validCount = 0;
    const samples: number[] = [];
    
    for (const edge of edges) {
      const value = getNestedValue(edge, field);
      const parsed = parseTimestamp(value);
      
      if (parsed !== null) {
        validCount++;
        if (samples.length < 5) {
          samples.push(parsed);
        }
      }
    }
    
    if (validCount > 0) {
      fieldInfo.push({
        field,
        count: validCount,
        coverage: (validCount / edges.length) * 100,
        sample: samples
      });
    }
  }
  
  // Sort by coverage (highest first)
  return fieldInfo.sort((a, b) => b.coverage - a.coverage);
}

/**
 * Find the time range from edges using the specified timestamp field
 */
export function findTimeRange(edges: Edge[], timestampField: string): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  let foundAny = false;
  
  for (const edge of edges) {
    const value = getNestedValue(edge, timestampField);
    const timestamp = parseTimestamp(value);
    
    if (timestamp !== null) {
      foundAny = true;
      min = Math.min(min, timestamp);
      max = Math.max(max, timestamp);
    }
  }
  
  return foundAny ? { min, max } : null;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number, format: 'date' | 'time' | 'datetime' | 'relative' = 'datetime'): string {
  const date = new Date(timestamp);
  
  switch (format) {
    case 'date':
      return date.toLocaleDateString();
    
    case 'time':
      return date.toLocaleTimeString();
    
    case 'datetime':
      return date.toLocaleString();
    
    case 'relative': {
      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return `${seconds}s ago`;
    }
    
    default:
      return date.toISOString();
  }
}

/**
 * Check if an edge falls within the selected time range
 */
export function isEdgeInTimeRange(edge: Edge, timestampField: string, range: { start: number; end: number }): boolean {
  const value = getNestedValue(edge, timestampField);
  const timestamp = parseTimestamp(value);
  
  if (timestamp === null) {
    // If edge has no timestamp, include it or exclude it based on preference
    return true; // Include edges without timestamps
  }
  
  return timestamp >= range.start && timestamp <= range.end;
}