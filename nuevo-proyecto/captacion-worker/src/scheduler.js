import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js';

const STATE_FILE = path.resolve(process.cwd(), 'scheduler_state.json');

let checkInterval = null;
let sendInProgress = false;
let onTrigger = null; // callback: () => void

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {}
  return { lastSendDate: null, lastResult: null, lastError: null };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function getSchedulerStatus() {
  const state = loadState();
  const today = getToday();
  const alreadySentToday = state.lastSendDate === today;
  return {
    running: checkInterval !== null,
    sendInProgress,
    lastSendDate: state.lastSendDate || null,
    alreadySentToday,
    lastResult: state.lastResult || null,
    lastError: state.lastError || null,
    nextRun: alreadySentToday ? null : '07:00 (hora VPS)',
  };
}

export function triggerDailySend() {
  if (sendInProgress) return { ok: false, reason: 'already_sending' };
  if (!onTrigger) return { ok: false, reason: 'scheduler_not_initialized' };
  sendInProgress = true;
  try {
    onTrigger();
  } catch (err) {
    sendInProgress = false;
    return { ok: false, error: err.message };
  }
  return { ok: true };
}

// Mark send as completed (called from server.js when child process exits)
export function markSendComplete(success) {
  sendInProgress = false;
  const state = loadState();
  state.lastSendDate = getToday();
  state.lastResult = success ? 'ok' : 'error';
  if (!success) state.lastError = new Date().toISOString();
  saveState(state);
}

async function checkAndRun() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const state = loadState();
  const today = getToday();

  if (hours === 7 && minutes <= 2 && state.lastSendDate !== today && !sendInProgress) {
    logger.info('⏰ Son las 7:00. Disparando envío diario programado...');
    triggerDailySend();
  }
}

export function startScheduler(spawnFn) {
  if (checkInterval) return;
  onTrigger = spawnFn;
  logger.info('⏰ Scheduler iniciado — comprobando cada 60s para enviar a las 7:00');
  checkAndRun();
  checkInterval = setInterval(checkAndRun, 60000);
}

export function stopScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    logger.info('⏰ Scheduler detenido.');
  }
}
