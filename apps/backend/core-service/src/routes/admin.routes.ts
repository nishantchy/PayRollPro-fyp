import express from "express";
import { register, login } from "../controllers/admin.controller";
import { uploadImage } from "../middlewares/file.middleware";

const router = express.Router();

// Admin routes
router.post(
  "/register",
  (req, res, next) => {
    console.log("Received registration request");
    next();
  },
  uploadImage.single("photo"),
  register as express.RequestHandler
);
router.post("/login", login as express.RequestHandler);

export default router;
