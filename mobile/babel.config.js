module.exports = function (api) {
  api.cache(true);
  return {
    // "nativewind/babel" is a preset (it returns a {plugins: [...]} config,
    // including react-native-reanimated's own plugin), not a plugin itself —
    // it must live in `presets`, not `plugins`.
    presets: ["babel-preset-expo", "nativewind/babel"],
  };
};
