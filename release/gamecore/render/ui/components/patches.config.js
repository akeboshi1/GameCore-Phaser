const normalizePatchesConfig = (config) => {
  config.bottom = config.bottom !== void 0 ? config.bottom : config.top;
  config.left = config.left !== void 0 ? config.left : config.top;
  config.right = config.right !== void 0 ? config.right : config.left;
  return config;
};
export { normalizePatchesConfig };
