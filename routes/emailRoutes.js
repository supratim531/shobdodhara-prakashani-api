import multer from "multer";
import { Router } from "express";
import {
  sendEnquiryEmailController,
  sendJoinRequestEmailController,
} from "../controllers/emailControllers.js";

const router = Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, DOCX, and image files (jpeg, png, webp) are allowed",
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

router.route("/enquiry").post(sendEnquiryEmailController);

router
  .route("/join")
  .post(upload.array("files", 5), sendJoinRequestEmailController);

export default router;
