import jwt from "jsonwebtoken";
import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).send({ message: "No token provided." });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded;
      console.log("The decoded user is:", req.user);
      next();
    } catch (error) {
      res.status(403).send({ message: "Token is invalid." });
    }
  } else {
    res.status(401).send({ message: "Authorization header is missing or malformed." });
  }
};

export default verifyToken;
