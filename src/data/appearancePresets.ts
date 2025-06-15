
export const appearancePresets: {
  name: string;
  key: string;
  config: Record<string, any>;
}[] = [
  {
    name: "Classic Blue",
    key: "classic-blue",
    config: {
      entity: {
        icon: "entity",
        backgroundColor: "#e6f0fa",
        lineColor: "#337ecc",
        size: 64,
        labelField: "label",
        showIconCircle: true,
        iconCircleColor: "#cde5fc",
      },
      process: {
        icon: "process",
        backgroundColor: "#f5e9d4",
        lineColor: "#e28c12",
        size: 64,
        labelField: "label",
        showIconCircle: false,
      },
      // ... additional types as desired
    },
  },
  {
    name: "Dark Mode Neon",
    key: "dark-neon",
    config: {
      entity: {
        icon: "entity",
        backgroundColor: "#16213e",
        lineColor: "#10f7ff",
        size: 72,
        labelField: "label",
        showIconCircle: true,
        iconCircleColor: "#10101a",
      },
      process: {
        icon: "process",
        backgroundColor: "#24243e",
        lineColor: "#ff0099",
        size: 72,
        labelField: "label",
        showIconCircle: false,
      },
      // ... additional types as desired
    },
  },
];
