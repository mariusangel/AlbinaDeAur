const jwt   = require("jsonwebtoken");
const User  = require("../models/User");
// backend/middleware/authMiddleware.js
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Nu sunteți autentificat!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[DEBUG] Decoded Token:", decoded); // Loghează token-ul decodat
    
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Utilizatorul nu există!" });
    }

    req.user = user; // Atașează întregul obiect user la req.user
    console.log("[DEBUG] User attached to request:", req.user); // Loghează user-ul
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid!" });
  }
};

module.exports = { protect };
