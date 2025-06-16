// Common emojis for graph visualization
export const EMOJI_ICONS = {
  // People & Roles
  person: '👤',
  user: '👤',
  admin: '👨‍💼',
  developer: '👨‍💻',
  designer: '👨‍🎨',
  manager: '👔',
  team: '👥',
  customer: '🛍️',
  
  // Organizations
  company: '🏢',
  office: '🏢',
  factory: '🏭',
  store: '🏪',
  bank: '🏦',
  hospital: '🏥',
  school: '🏫',
  
  // Technology
  server: '🖥️',
  database: '🗄️',
  cloud: '☁️',
  mobile: '📱',
  computer: '💻',
  robot: '🤖',
  gear: '⚙️',
  
  // Data & Documents
  document: '📄',
  folder: '📁',
  email: '📧',
  message: '💬',
  chart: '📊',
  report: '📈',
  
  // Network & Security
  lock: '🔒',
  unlock: '🔓',
  key: '🔑',
  shield: '🛡️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  
  // Location
  location: '📍',
  map: '🗺️',
  globe: '🌍',
  home: '🏠',
  
  // Products & Services
  product: '📦',
  package: '📦',
  cart: '🛒',
  tag: '🏷️',
  
  // Finance
  money: '💰',
  credit: '💳',
  dollar: '💵',
  euro: '💶',
  bitcoin: '₿',
  
  // Time & Events
  clock: '🕐',
  calendar: '📅',
  alarm: '⏰',
  timer: '⏱️',
  
  // Communication
  phone: '📞',
  video: '📹',
  microphone: '🎤',
  speaker: '🔊',
  
  // Actions
  search: '🔍',
  edit: '✏️',
  delete: '🗑️',
  add: '➕',
  remove: '➖',
  
  // Status
  online: '🟢',
  offline: '🔴',
  away: '🟡',
  busy: '🟠',
  
  // Miscellaneous
  star: '⭐',
  heart: '❤️',
  fire: '🔥',
  lightning: '⚡',
  idea: '💡',
  question: '❓',
  info: 'ℹ️',
  flag: '🚩',
};

// Get all emoji keys for selection
export const EMOJI_ICON_KEYS = Object.keys(EMOJI_ICONS);

// Helper to check if a string is an emoji
export function isEmoji(str: string): boolean {
  // Check if the string matches common emoji patterns
  const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]$/u;
  return emojiRegex.test(str) || Object.values(EMOJI_ICONS).includes(str);
}