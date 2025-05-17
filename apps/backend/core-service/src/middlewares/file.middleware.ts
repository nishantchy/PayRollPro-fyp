import multer from "multer";

const fileStorage = multer.memoryStorage();

export const uploadFiles = multer({
  storage: fileStorage,
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image, PDF, and Word document files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const imageStorage = multer.memoryStorage();
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: (_req, file, cb) => {
    console.log("Processing file upload:", file.originalname, file.mimetype);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const documentStorage = multer.memoryStorage();
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word document files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
