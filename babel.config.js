module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['@babel/preset-react', { runtime: 'classic' }],
      ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
    ],
    plugins: ['dynamic-import-node', '@babel/plugin-transform-modules-commonjs'],
  };
};
