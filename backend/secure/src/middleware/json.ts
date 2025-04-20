export const jsonValidator = (req, res, next) => {
  // Only apply to requests with JSON content-type
  if (req.is("application/json")) {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        // Try to parse the JSON
        req.body = JSON.parse(data);
        next();
      } catch (e) {
        // Send error response and don't call next()
        res.status(400).json({ error: "Invalid JSON format" });
        // Router chain stops here since next() isn't called
      }
    });
  } else {
    next();
  }
};
