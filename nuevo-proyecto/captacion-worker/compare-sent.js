import fs from 'fs';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';

// Leer CSV
const csvContent = fs.readFileSync('./All_Spain_Leads.csv', 'utf-8');
const csvLeads = parse(csvContent, { columns: true });

// Leer BD
const db = new Database('./data/outreach.sqlite');
const dbEmails = db.prepare("SELECT email FROM leads").all().map(r => r.email);

console.log('\n📋 COMPARATIVA:');
console.log(`  Total en CSV: ${csvLeads.length}`);
console.log(`  Total en BD: ${dbEmails.length}`);

// Encontrar faltantes
const missed = csvLeads.filter(lead => lead.Email && !dbEmails.includes(lead.Email));
console.log(`  ❌ Para enviar: ${missed.length}\n`);

// Mostrar primeros 10 faltantes
console.log('Primeros 10 a enviar:');
missed.slice(0, 10).forEach((m, i) => {
  console.log(`  ${i+1}. ${m.Email} - ${m.Name || 'Sin nombre'}`);
});

// Guardar faltantes en CSV
const headerLine = Object.keys(csvLeads[0]).join(',');
const missedLines = missed.map(m =>
  Object.keys(csvLeads[0]).map(k => {
    const val = m[k] || '';
    return `"${val.toString().replace(/"/g, '""')}"`;
  }).join(',')
);
const missedCsv = [headerLine, ...missedLines].join('\n');
fs.writeFileSync('./Faltantes_por_enviar.csv', missedCsv);
console.log(`\n✅ Guardado: Faltantes_por_enviar.csv (${missed.length} leads)`);

db.close();
