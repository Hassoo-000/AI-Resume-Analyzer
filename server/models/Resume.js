import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
    analysis: {
      type: Object,
    },
    extractedText: {
      type: String,
    },
    jobMatch: {
      type: Object,
    },
    // rewriteResult: {
    //   type: Object,
    // },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;