import express from "express";
import { uploadResume, getMyResumes } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { analyzeResume } from "../controllers/resumeController.js";
import { matchWithJob } from "../controllers/resumeController.js";

// import { rewriteResume } from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/my", protect, getMyResumes);
router.post("/analyze/:resumeId", protect, analyzeResume);
router.post("/match/:resumeId", protect, matchWithJob);

// router.post("/rewrite/:resumeId", protect, rewriteResume);

export default router;