'use strict';

const axios = require('axios');
const axiosRetry = require('axios-retry').default;

const TIMEOUT_MS = 30000;
const USER_AGENT = 'Mozilla/5.0 (compatible; RadarBOE/1.0; +https://mavie.es)';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function createHttpClient() {
  const client = axios.create({
    timeout: TIMEOUT_MS,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json, text/html, application/xml',
    },
  });

  axiosRetry(client, {
    retries: MAX_RETRIES,
    retryDelay: (retryCount) => retryCount * RETRY_DELAY_MS,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status >= 500),
  });

  return client;
}

class BaseScraper {
  constructor(name) {
    this.name = name;
    this.httpClient = createHttpClient();
  }

  cleanText(text) {
    if (!text) return '';
    return text.toString().replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  }

  async fetchItems() {
    throw new Error(`fetchItems() must be implemented by ${this.name}`);
  }

  handleError(error, context) {
    const ctx = context || '';
    if (error.response) {
      console.error(`[${this.name}] API error ${error.response.status} — ${ctx}`);
    } else if (error.request) {
      console.error(`[${this.name}] Network error — ${ctx}: ${error.message}`);
    } else {
      console.error(`[${this.name}] Error — ${ctx}: ${error.message}`);
    }
  }
}

module.exports = { BaseScraper, createHttpClient };
