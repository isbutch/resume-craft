// Run TypeScript data-boundary checks without adding a test framework.
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { parseResume, freshResume, blankResume, isRetiredExample } = require('../src/utils/resumeData.ts');
let count = 0;
function check(name, run) { run(); count++; console.log('PASS ' + name); }
check('JSON backup round-trip preserves all existing fields and normalizes idempotently', () => {
 const source = freshResume(), normalized = parseResume(JSON.parse(JSON.stringify(source)));
 const compare = (a, b) => { if (a && typeof a === 'object') { for (const key of Object.keys(a)) compare(a[key], b[key]); } else assert.deepEqual(b, a); };
 compare(source, normalized); assert.deepEqual(parseResume(normalized), normalized);
});
check('Blank resume has no sample personal data or items', () => {
 const data = blankResume(); assert.equal(data.personalInfo.name, ''); assert.equal(data.personalInfo.avatar, '');
 assert.equal(data.styling.showAvatar, false);
 for (const section of Object.values(data.sections)) assert.deepEqual(section.items, []);
});
check('Legacy partial headers merge defaults', () => {
 const data = freshResume(); data.sections.education.header = { title: '学历' }; delete data.styling; delete data.sections.research;
 const parsed = parseResume(data); assert.equal(parsed.sections.education.header.title, '学历'); assert.equal(parsed.sections.education.header.show, true); assert.ok(parsed.sections.research);
});
for (const [name, mutate] of [
 ['null personal info', d => d.personalInfo = null], ['contacts object', d => d.personalInfo.contacts = {}],
 ['invalid item', d => d.sections.projects.items = [null]], ['non-string content', d => d.sections.skills.items[0].content = {}],
 ['invalid tags', d => d.sections.projects.items[0].techChain = [7]], ['invalid header', d => d.sections.education.header.show = 'yes'],
 ['injected color', d => d.styling.themeColor = 'red; } body { display:none'], ['invalid template', d => d.styling.templateId = 'unknown'],
 ['infinite avatar size', d => d.styling.avatarSize = Infinity], ['script avatar', d => d.personalInfo.avatar = 'javascript:alert(1)'],
 ['invalid module order', d => d.styling.sectionOrder = ['__proto__']], ['oversized list', d => d.personalInfo.contacts = Array(501).fill({})],
]) check('Rejects ' + name, () => { const data = freshResume(); mutate(data); assert.throws(() => parseResume(data)); });
check('Duplicate IDs are repaired without dropping entries', () => {
 const data = freshResume(); data.sections.skills.items[1].id = data.sections.skills.items[0].id;
 const result = parseResume(data); assert.equal(new Set(result.sections.skills.items.map(i => i.id)).size, result.sections.skills.items.length);
});
check('Unknown and prototype properties are never copied', () => {
 const data = JSON.parse(JSON.stringify(freshResume())); data.personalInfo.constructor = { prototype: { polluted: true } }; data.extra = 'ignore';
 const result = parseResume(data); assert.equal(Object.hasOwn(result.personalInfo, 'constructor'), false); assert.equal(Object.hasOwn(result, 'extra'), false); assert.equal({}.polluted, undefined);
});
check('Partial order includes remaining modules exactly once', () => {
 const data = freshResume(); data.styling.sectionOrder = ['projects', 'projects'];
 const order = parseResume(data).styling.sectionOrder; assert.equal(order[0], 'projects'); assert.equal(order.length, 5);
});
check('Legacy demo cache is detected without matching anonymous content', () => {
 const legacy = freshResume(); legacy.id = 'resume-1';
 assert.equal(isRetiredExample(legacy), true);
 assert.equal(isRetiredExample(freshResume()), false);
});
check('Retired sidebar and elegant backups retain content with classic layout', () => {
 for (const templateId of ['sidebar', 'elegant']) {
  const data = freshResume(); data.styling.templateId = templateId;
  const parsed = parseResume(data); assert.equal(parsed.styling.templateId, 'classic');
  assert.deepEqual(parsed.personalInfo, data.personalInfo);
  assert.equal(parsed.sections.projects.items[0].contributions, data.sections.projects.items[0].contributions);
 }
});
console.log(`${count} checks passed.`);
