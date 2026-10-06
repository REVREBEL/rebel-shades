const { rollup } = require('rollup');

const virtualEntry = '\0copy-text-to-clipboard-smoke-entry';

(async () => {
  const packageEntry = require.resolve('copy-text-to-clipboard');

  const bundle = await rollup({
    input: virtualEntry,
    plugins: [
      {
        name: 'copy-text-to-clipboard-smoke-resolver',
        resolveId(source) {
          if (source === virtualEntry) return virtualEntry;
          if (source === 'copy-text-to-clipboard') return packageEntry;
          return null;
        },
        load(id) {
          if (id === virtualEntry) {
            return "import Copy from 'copy-text-to-clipboard'; export default Copy;";
          }
          return null;
        }
      }
    ]
  });

  const { output } = await bundle.generate({ format: 'esm' });
  const chunk = output.find(item => item.type === 'chunk');

  if (!chunk || !chunk.exports.includes('default')) {
    throw new Error('copy-text-to-clipboard did not bundle with a default export.');
  }

  console.log(
    `Verified copy-text-to-clipboard can be resolved and bundled by Rollup ${require('rollup/package.json').version}.`
  );
})();
