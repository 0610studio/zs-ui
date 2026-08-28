module.exports = ({ config }) => {
  const docsBaseUrl = process.env.ZS_UI_DOCS_BASE_URL;

  if (!docsBaseUrl) {
    return config;
  }

  return {
    ...config,
    web: {
      ...config.web,
      output: 'static',
    },
    experiments: {
      ...config.experiments,
      baseUrl: docsBaseUrl,
    },
  };
};
