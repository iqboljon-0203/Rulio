// Uzbek Latin -> Cyrillic transliteration (official 1995 alphabet mapping).
// Leaves URLs, markdown link targets and brand names untouched.

const KEEP = ['Rulio', 'Payme', 'Click', 'Telegram', 'Instagram', 'Google', 'YouTube', 'PRO', 'VS', 'rulio.uz', '@rulio.uz'];

const APOS = "['’ʼʻ`‘]";
const MULTI: [RegExp, string][] = [
  [new RegExp(`O${APOS}`, 'g'), 'Ў'],
  [new RegExp(`o${APOS}`, 'g'), 'ў'],
  [new RegExp(`G${APOS}`, 'g'), 'Ғ'],
  [new RegExp(`g${APOS}`, 'g'), 'ғ'],
  [/SH/g, 'Ш'], [/Sh/g, 'Ш'], [/sh/g, 'ш'],
  [/CH/g, 'Ч'], [/Ch/g, 'Ч'], [/ch/g, 'ч'],
  [/YO/g, 'Ё'], [/Yo/g, 'Ё'], [/yo/g, 'ё'],
  [/YU/g, 'Ю'], [/Yu/g, 'Ю'], [/yu/g, 'ю'],
  [/YA/g, 'Я'], [/Ya/g, 'Я'], [/ya/g, 'я'],
  [/YE/g, 'Е'], [/Ye/g, 'Е'], [/ye/g, 'е'],
  // e at the start of a word is Э
  [/(^|[^A-Za-zА-Яа-яЎўҒғҚқҲҳЁё])E/g, '$1Э'],
  [/(^|[^A-Za-zА-Яа-яЎўҒғҚқҲҳЁё])e/g, '$1э'],
  [new RegExp(`(?<=[A-Za-zА-Яа-яЎўҒғҚқҲҳ])${APOS}(?=[A-Za-zА-Яа-яЎўҒғҚқҲҳ])`, 'g'), 'ъ'],
];

const SINGLE: Record<string, string> = {
  a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н',
  o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'с', w: 'в',
};

function convertChunk(s: string): string {
  for (const [re, rep] of MULTI) s = s.replace(re, rep);
  let out = '';
  for (const ch of s) {
    const lower = ch.toLowerCase();
    const m = SINGLE[lower];
    out += m ? (ch === lower ? m : m.toUpperCase()) : ch;
  }
  return out;
}

const PROTECT = new RegExp(
  [
    'https?:\\/\\/\\S+',
    '\\]\\([^)]*\\)', // markdown link target
    ...KEEP.map((k) => `\\b${k.replace(/[.@]/g, (c) => `\\${c}`)}\\b`),
  ].join('|'),
  'g',
);

export function toCyrillic(text: string): string {
  if (!text) return text;
  let out = '';
  let last = 0;
  for (const m of text.matchAll(PROTECT)) {
    out += convertChunk(text.slice(last, m.index));
    out += m[0];
    last = (m.index ?? 0) + m[0].length;
  }
  return out + convertChunk(text.slice(last));
}
