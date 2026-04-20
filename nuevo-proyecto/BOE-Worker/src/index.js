require('dotenv').config();
const { runWorker } = require('./scrapers/orchestrator');

runWorker().catch(err => {
  console.error('[Worker] Error fatal:', err.message);
  process.exit(1);
});
