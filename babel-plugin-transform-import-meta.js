// Babel plugin to transform import.meta.env to process.env in test environment
module.exports = function () {
  return {
    name: 'transform-import-meta',
    visitor: {
      MetaProperty(path) {
        if (
          path.get('meta').isIdentifier({ name: 'import' }) &&
          path.get('property').isIdentifier({ name: 'env' })
        ) {
          path.replaceWithSourceString('process.env');
        }
      },
    },
  };
};
