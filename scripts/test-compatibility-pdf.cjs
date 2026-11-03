const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { pageSlices, imagePageLayout } = require('../src/utils/compatibilityPdf.ts');
let count = 0;
function check(name, run) { run(); count++; console.log('PASS ' + name); }
check('Slight overflow fits on one A4 page without an almost empty second page', () => {
  const layout = imagePageLayout(1980, 3000);
  assert.equal(layout.pageHeight, 3000);
  assert.ok(layout.drawWidthMm < 198 && layout.drawWidthMm >= 198 / 1.15);
  assert.ok(3000 * layout.drawWidthMm / 1980 <= 285);
});
check('Long resumes paginate without shrinking text to fit one page', () => {
  const layout = imagePageLayout(1980, 9000);
  assert.equal(layout.drawWidthMm, 198);
  assert.equal(layout.pageHeight, 2850);
});
check('Exact page height does not create an empty trailing page', () => {
  assert.deepEqual(pageSlices(600, 300), [{start:0,end:300},{start:300,end:600}]);
});
check('Whitespace page breaks cover every pixel once without dropping final rows', () => {
  const slices = pageSlices(1010, 300, (start, end) => end - 15);
  assert.equal(slices[0].start, 0); assert.equal(slices.at(-1).end, 1010);
  slices.forEach((slice, i) => { assert.ok(slice.end > slice.start); assert.ok(slice.end - slice.start <= 300); if (i) assert.equal(slice.start, slices[i-1].end); });
});
check('Bad break candidates cannot cause infinite loops or missing pixels', () => {
  for (const bad of [NaN, Infinity, -1, 0, 999, 1.5]) assert.equal(pageSlices(700, 300, () => bad).at(-1).end, 700);
});
check('Invalid dimensions fail before canvas allocation', () => {
  for (const bad of [0, -1, NaN, Infinity, 1.5]) { assert.throws(() => pageSlices(bad, 300)); assert.throws(() => pageSlices(300, bad)); assert.throws(() => imagePageLayout(300, bad)); }
});
console.log(`${count} PDF pagination checks passed.`);
