import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const ALLOWED_CATEGORIES = new Set(["book", "clothes"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Example: in future 'perfume' can be added
// ALLOWED_CATEGORIES.add("perfume");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category?.toLowerCase();

    if (!ALLOWED_CATEGORIES.has(category)) {
      return cb(new Error("Invalid category provided!"));
    }

    const uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      `${category}`
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, extension);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${encodeURIComponent(fileName)}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    ALLOWED_MIME_TYPES.has(file.mimetype) &&
    ALLOWED_EXTENSIONS.has(extension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // maximum size limit is 5mb
});
