module.exports = function cdnLoader(source) {
  if (source.match(/^module\.exports ?\= ?"data:/)) {
    return source;
  }
  const sourceContent = source.replace(/^module\.exports ?\= ?([^;]+);$/, '$1');
  return `module.exports = window.replaceDependencyWithCdnForChe(${ sourceContent });`;
}
