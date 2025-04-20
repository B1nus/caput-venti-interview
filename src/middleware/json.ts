export const jsonValidator = (req, res, next) => {
  if (req.is("application/json")) {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        req.body = JSON.parse(data);
        next();
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON format" });
      }
    });
  } else {
    next();
  }
};
