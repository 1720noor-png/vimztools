const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'reports', 'complete-tools-documentation-audit', 'all-1059-tools-master-table.csv');
const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);

let md = '# Vimz.ai — Master Table of All 1,059 Tools (Name, Purpose & Working)\n\n';
md += '**Total Registered Tools:** 1,059  \n';
md += '**Production Base URL:** https://charming-vitality-production-dd02.up.railway.app  \n';
md += '**Audit Date:** October 13, 2026  \n\n';
md += '| # | Tool Name | Category | Purpose | Actual Working / Processing Logic |\n';
md += '| :-: | :--- | :--- | :--- | :--- |\n';

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  const num = cols[0];
  const name = (cols[1] || '').replace(/\|/g, '\\|');
  const cat = (cols[3] || '').replace(/\|/g, '\\|');
  const purpose = (cols[5] || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const working = (cols[7] || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  md += `| ${num} | **${name}** | ${cat} | ${purpose} | ${working} |\n`;
}

const outPath = path.join(__dirname, '..', 'reports', 'complete-tools-documentation-audit', 'all-1059-tools-name-purpose-working-table.md');
fs.writeFileSync(outPath, md, 'utf8');
console.log('Successfully generated:', outPath, 'Bytes:', md.length, 'Lines:', md.split('\n').length);
