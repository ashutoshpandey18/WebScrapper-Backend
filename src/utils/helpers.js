/**
 * Validation helpers
 */

/**
 * Validate search parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result { isValid: boolean, errors: Array }
 */
function validateSearchParams(params) {
  const errors = [];

  if (!params.search || typeof params.search !== 'string' || params.search.trim().length === 0) {
    errors.push('Search term is required and must be a non-empty string');
  }

  if (!params.location || typeof params.location !== 'string' || params.location.trim().length === 0) {
    errors.push('Location is required and must be a non-empty string');
  }

  if (params.limit && (typeof params.limit !== 'number' || params.limit < 1 || params.limit > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format results for consistent output
 * @param {Array} results - Raw results
 * @returns {Array} Formatted results
 */
function formatResults(results) {
  return results.map(result => ({
    name: result.name || 'Unknown',
    address: result.address || 'Address not available',
    rating: result.rating || null,
    link: result.link || null,
    source: result.source || 'unknown',
    timestamp: new Date().toISOString()
  }));
}

/**
 * Sleep utility for rate limiting between requests
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate search-friendly string
 * @param {string} str - Input string
 * @returns {string} Search-friendly string
 */
function toSearchQuery(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '+');
}

module.exports = {
  validateSearchParams,
  formatResults,
  sleep,
  toSearchQuery
};