const fs = require('fs');
const path = require('path');

// Uso: node clean_leads.js archivo_entrada.csv archivo_salida.csv

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'leads_limpios.csv';

if (!inputFile) {
  console.error("❌ Error: Debes especificar el archivo CSV de entrada.");
  console.log("👉 Ejemplo: node clean_leads.js mis_18k_leads.csv");
  process.exit(1);
}

try {
  const data = fs.readFileSync(path.resolve(inputFile), 'utf-8');
  
  // Dividir por líneas
  const lines = data.split(/\r?\n/);
  if (lines.length === 0) {
    console.error("El archivo está vacío.");
    process.exit(1);
  }

  const header = lines[0];
  const rows = lines.slice(1);

  const uniqueEmails = new Set();
  const validRows = [];

  // Expresiones regulares para correos genéricos que no suelen comprar (info@, admin@, etc.)
  const genericEmailRegex = /^(info|contacto|admin|hola|hello|soporte|support|ventas|sales|webmaster)@/i;

  let duplicatedCount = 0;
  let genericCount = 0;
  let invalidCount = 0;

  for (const row of rows) {
    if (!row.trim()) continue;
    
    // Suponemos que es un CSV separado por comas. Si tiene comillas, esto es una partición básica.
    const columns = row.split(',');
    
    // Buscar la columna que contiene un '@' asumiendo que es el email.
    // Esto es heurístico. Si sabes la columna exacta (ej. col 1), cámbialo a columns[1].
    const emailColIndex = columns.findIndex(col => col.includes('@'));
    
    if (emailColIndex === -1) {
      invalidCount++;
      continue; // No hay email
    }

    const email = columns[emailColIndex].trim().toLowerCase().replace(/['"]/g, '');

    // Verificar si es duplicado
    if (uniqueEmails.has(email)) {
      duplicatedCount++;
      continue;
    }

    // Verificar si es genérico
    if (genericEmailRegex.test(email)) {
      genericCount++;
      // Podrías decidir guardarlos igual o no. Los ignoramos para mayor calidad.
      continue;
    }

    uniqueEmails.add(email);
    validRows.push(row);
  }

  // Escribir archivo de salida
  const outputData = [header, ...validRows].join('\n');
  fs.writeFileSync(path.resolve(outputFile), outputData, 'utf-8');

  console.log("✅ Limpieza completada con éxito:");
  console.log(`- Total líneas procesadas: ${rows.length}`);
  console.log(`- Duplicados eliminados: ${duplicatedCount}`);
  console.log(`- Correos genéricos eliminados (info@...): ${genericCount}`);
  console.log(`- Filas sin email eliminadas: ${invalidCount}`);
  console.log(`\n🎉 Leads limpios y listos para vender: ${validRows.length}`);
  console.log(`📂 Guardado en: ${outputFile}`);

} catch (error) {
  console.error("❌ Error al procesar el archivo:", error.message);
}
