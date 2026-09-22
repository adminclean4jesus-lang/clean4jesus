module.exports = ({ config }) => {
  if (process.env.CLEAN4JESUS_PLATFORM === "android") {
    return {
      expo: {
        ...config,
        plugins: (config.plugins ?? []).filter((plugin) => {
          const name = Array.isArray(plugin) ? plugin[0] : plugin;
          return name !== "@bacons/apple-targets";
        }),
      },
    };
  }

  return { expo: config };
};
