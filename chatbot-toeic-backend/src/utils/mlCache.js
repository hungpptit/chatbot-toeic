// ========================================
// FILE: src/utils/mlCache.js
// MỤC ĐÍCH: Unified cache interface with Redis fallback to in-memory cache
// ========================================

import NodeCache from 'node-cache';
import Redis from 'ioredis';

// Initialize cache based on environment
let cache;
let cacheType;

if (process.env.REDIS_URL) {
  try {
    cache = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed, falling back to in-memory cache');
          cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });
          cacheType = 'memory';
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });
    cacheType = 'redis';
    console.log('✅ Using Redis for ML caching');
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, using in-memory cache:', error.message);
    cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });
    cacheType = 'memory';
  }
} else {
  cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });
  cacheType = 'memory';
  console.log('✅ Using in-memory cache for ML (set REDIS_URL for Redis)');
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
export async function getCache(key) {
  try {
    if (cacheType === 'redis') {
      const value = await cache.get(key);
      return value ? JSON.parse(value) : null;
    } else {
      return cache.get(key) || null;
    }
  } catch (error) {
    console.error('❌ Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 120)
 * @returns {Promise<boolean>} Success status
 */
export async function setCache(key, value, ttl = 120) {
  try {
    if (cacheType === 'redis') {
      await cache.setex(key, ttl, JSON.stringify(value));
    } else {
      cache.set(key, value, ttl);
    }
    return true;
  } catch (error) {
    console.error('❌ Cache set error:', error);
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export async function delCache(key) {
  try {
    if (cacheType === 'redis') {
      await cache.del(key);
    } else {
      cache.del(key);
    }
    return true;
  } catch (error) {
    console.error('❌ Cache delete error:', error);
    return false;
  }
}

export default { getCache, setCache, delCache };
