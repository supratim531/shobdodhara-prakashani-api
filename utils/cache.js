import { redisClient } from "../config/redisConfig.js";

/**
 * Generate cache key from HTTP request
 * @param {Object} req - Express request object
 * @returns {string} Generated cache key
 */
const generateCacheKey = (req) => {
  const queryParams = req.query;
  const baseURL = req.baseUrl.replace(/^\/+|\/+$/g, "").replace(/\//g, ":");

  const sortedQueryParams = Object.keys(queryParams)
    .sort()
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&");

  return sortedQueryParams ? `${baseURL}:${sortedQueryParams}` : baseURL;
};

/**
 * Get data from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed data or null if not found
 */
const cacheGet = async (key) => {
  try {
    const data = await redisClient.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);

    return null;
  }
};

/**
 * Set data in Redis cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
const cacheSet = async (key, data, ttl = 300) => {
  try {
    const res = await redisClient.setex(key, ttl, JSON.stringify(data));
    console.log("cacheSet:", { res });

    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);

    return false;
  }
};

/**
 * Invalidate cache keys matching patterns
 * @param {string|string[]} patterns - Pattern(s) to match keys for deletion
 * @returns {Promise<number>} Number of keys deleted
 */
const cacheInvalidate = async (patterns) => {
  try {
    let totalDeleted = 0;
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];

    for (const pattern of patternArray) {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        const deleted = await redisClient.del(...keys);
        totalDeleted += deleted;
      }
    }

    return totalDeleted;
  } catch (error) {
    console.error(`Cache invalidate error for patterns ${patterns}:`, error);

    return 0;
  }
};

/**
 * Higher-order function to wrap service functions with caching
 * @param {Function} serviceFunction - Original service function to wrap
 * @param {Object} cacheConfig - Cache configuration object
 * @param {Function} cacheConfig.keyGenerator - Function to generate cache key from arguments
 * @param {number} cacheConfig.ttl - Time to live in seconds
 * @returns {Function} Wrapped function with caching
 */
const withCache = (serviceFunction, cacheConfig) => {
  return async (...args) => {
    const cacheKey = cacheConfig.keyGenerator();
    console.log("withCache: cacheKey:", { cacheKey });

    // Try cache first
    const cached = await cacheGet(cacheKey);

    if (cached) return cached;

    // Execute original function
    const result = await serviceFunction(...args);

    // Cache the result
    await cacheSet(cacheKey, result, cacheConfig.ttl);

    return result;
  };
};

export { generateCacheKey, cacheGet, cacheSet, cacheInvalidate, withCache };
