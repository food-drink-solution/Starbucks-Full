// i18n audit: file inventory, missing keys, hardcoded strings
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const git = (args) => { try { return execSync('git ' + args, { encoding: 'utf8', maxBuffer: 268435456 }); } catch { return ''; } };

console.log('=== 1. i18n module files ===');
console.log(git('ls-files Frontend/src/i18n.ts'));

console.log('=== 2. full locale file list (en vs ar) ===');
const list = (lang) => (lang ? git(`ls-files Frontend/src/locales/${lang}`) : '').trim().split(/\r?\n/).filter(Boolean).map(l => l.replace(new RegExp('^Frontend/src/locales/' + lang + '/'), '')).sort();
const en = list('en'), ar = list('ar');
console.log('en files:', en.length, '| ar files:', ar.length);
console.log('only in en:', JSON.stringify(en.filter(f => !ar.includes(f))));
console.log('only in ar:', JSON.stringify(ar.filter(f => !en.includes(f))));
