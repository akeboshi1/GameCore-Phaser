var normalizePatchesConfig = function (config) {
    config.bottom = (config.bottom !== undefined) ? config.bottom : config.top;
    config.left = (config.left !== undefined) ? config.left : config.top;
    config.right = (config.right !== undefined) ? config.right : config.left;
    return config;
};
export { normalizePatchesConfig };
//# sourceMappingURL=patches.config.js.map