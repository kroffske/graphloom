// Simple logger that outputs copyable strings
export const copyLog = (label: string, data: any) => {
  let output = `[${label}]`;
  
  if (data instanceof Map) {
    const obj: any = {};
    data.forEach((value, key) => {
      obj[key] = value;
    });
    output += ' ' + JSON.stringify(obj);
  } else if (typeof data === 'object' && data !== null) {
    output += ' ' + JSON.stringify(data);
  } else {
    output += ' ' + String(data);
  }
  
  // Single line, easy to copy
  console.log(output);
  
  // Also return the string for further use
  return output;
};