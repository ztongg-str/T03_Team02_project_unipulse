/**
 * Slow Query Logger Middleware
 *
 * WHAT IT DOES:
 * Times every API request. If a request takes longer than 1 second,
 * it logs a warning to the console so developers know something is slow.
 *
 * WHY WE NEED IT:
 * Without this, you'd never know if a database query is slow until
 * a user complains. This catches performance problems early.
 *
 * HOW IT WORKS:
 * 1. Record the start time when the request comes in
 * 2. When the response finishes, calculate the duration
 * 3. If duration > 1 second, log a warning with the URL and time
 */

export default function slowQueryLogger(req, res, next) {
  const start = Date.now();

  // Listen for the response 'finish' event (fires when response is sent)
  res.on('finish', () => {
    const duration = Date.now() - start;

    // Only log requests that took longer than 1 second
    if (duration > 1000) {
      const method = req.method;
      const url = req.originalUrl || req.url;
      console.warn(
        `[SLOW] ${method} ${url} took ${(duration / 1000).toFixed(1)}s`
      );
    }
  });

  next();
}
