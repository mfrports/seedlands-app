// The day Seedlands is on the App Store, the site's keys change by themselves.
//
// Every page carries both faces of the App Store's key, and <html data-store="soon"> says
// which one shows: the hollow "Coming to the App Store", or the lit key "Get Seedlands on
// the App Store". This asks Apple's public lookup whether the app is there (in any of a
// few storefronts); once it is, it sets data-store="live" in every page. The workflow
// beside it runs this once an hour, publishes the change and then switches itself off.
//
//   node .github/go-live.mjs            ask, and change the pages if the app is there
//   node .github/go-live.mjs --dry      ask and say what would change, write nothing
//   node .github/go-live.mjs --pretend  change the pages as if the app were there (to try it)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = '6832922834';
const STOREFRONTS = ['us', 'ch', 'de', 'gb'];
const SOON = '<html lang="en" data-store="soon">', LIVE = '<html lang="en" data-store="live">';
const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry'), pretend = process.argv.includes('--pretend');

async function listed() {
  for (const country of STOREFRONTS) {
    try {
      const answer = await (await fetch(`https://itunes.apple.com/lookup?id=${APP}&country=${country}`, { signal: AbortSignal.timeout(20000) })).json();
      if (answer.resultCount > 0) return country;
    } catch (error) {
      console.log(`lookup (${country}) failed: ${error.message}`);
    }
  }
  return null;
}

const where = pretend ? 'pretend' : await listed();
if (!where) { console.log('Not on the App Store yet.'); process.exit(0); }
console.log(`Seedlands is on the App Store (${where}).`);

let changed = 0;
for (const name of readdirSync(site).filter((f) => f.endsWith('.html'))) {
  const file = join(site, name), html = readFileSync(file, 'utf8');
  if (!html.includes(SOON)) continue;
  changed++;
  console.log(`${dry ? 'would change' : 'changed'} ${name}`);
  if (!dry) writeFileSync(file, html.replace(SOON, LIVE));
}
console.log(changed ? `${changed} page(s).` : 'The pages already say so.');
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `live=true\nchanged=${changed > 0 && !dry}\n`, { flag: 'a' });
