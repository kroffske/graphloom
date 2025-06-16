
import { EMOJI_ICON_KEYS } from './emojiIcons';

// Icon groups including emojis
export const ICON_GROUPS: Record<string, string[]> = {
  "Classic": [
    "entity", "process", "data-store", "event", "decision", "external-system",
    // 18 new icons
    "api", "service", "microservice", "webhook", "cache", "queue", "stream",
    "warehouse", "server", "load-balancer", "gateway", "firewall", "workflow",
    "rule", "connector", "monitor", "alert", "security"
  ],
  "Lucide": [
    "user", "activity", "alert-circle", "airplay", "air-vent", "alarm-clock", "align-center", "align-justify", "anchor",
    "archive", "archive-x", "award", "baby", "battery", "bell", "bell-off", "book", "bookmark", "box", "briefcase", "building", "calendar", "camera", "car", "check", "chevron-down",
    "circle", "clipboard", "clock", "cloud", "code", "cog", "coffee", "compass", "computer", "copy", "cpu", "database", "dice", "disc", "dollar-sign", "download", "edit", "eye",
    "file", "filter", "flag", "folder", "gift", "globe", "grid", "heart", "help-circle", "home", "image", "info", "key", "layers", "layout", "lightbulb", "link", "list", "lock",
    "log-in", "log-out", "mail", "map-pin", "map", "menu", "message-square", "mic", "minus", "monitor", "moon", "more-horizontal", "more-vertical", "move", "music", "package", "paperclip", "pause", "pen", "percent",
    "phone", "pie-chart", "play", "plus", "power", "printer", "refresh-cw", "save",
    "scissors", "search", "send", "settings", "share", "shield", "shopping-cart", "shuffle", "sidebar", "signal", "sliders", "star", "sun", "tag", "target", "terminal", "thermometer", "thumbs-down", "thumbs-up", "trash", "trash-2", "trending-up",
    "truck", "tv", "umbrella", "unlock", "upload", "user-check", "users", "video", "volume", "watch", "wifi", "x", "youtube", "zap"
  ],
  "Emoji": EMOJI_ICON_KEYS
};
