// Express recognizes error-handling middleware by its 4-argument signature.
export function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}
