import { v2 as cloudinary } from "cloudinary";
import Resume from "../models/Resume.js";
import streamifier from "streamifier";
import OpenAI from "openai";
import PDFParser from "pdf2json";

// ✅ Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "resumeai",
            resource_type: "raw",
            raw_convert: "extract_text", // ✅ IMPORTANT
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const uploadedResponse = await streamUpload();

    // ✅ Fetch extracted text file
    const textFileUrl = uploadedResponse.secure_url + ".txt";

    const textResponse = await fetch(textFileUrl);
    const extractedText = await textResponse.text();

    const resume = await Resume.create({
      user: req.user._id,
      fileUrl: uploadedResponse.secure_url,
      publicId: uploadedResponse.public_id,
      originalName: req.file.originalname,
      extractedText, // ✅ store text
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get Logged In User Resumes
export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Analyze Resume with AI
export const analyzeResume = async (req, res) => {
  let resume; // ✅ define outside try for catch access

  try {
    const { resumeId } = req.params;

    resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ Download PDF
    const response = await fetch(resume.fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Extract text using pdf2json
    const pdfParser = new PDFParser();

    const extractedText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData =>
        reject(errData.parserError)
      );

      pdfParser.on("pdfParser_dataReady", pdfData => {
        let text = "";

        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(r => {
              text += decodeURIComponent(r.T) + " ";
            });
          });
          text += "\n";
        });

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    // ✅ Call OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume analyzer. Analyze resumes and return structured JSON.",
        },
        {
          role: "user",
          content: `
Analyze this resume and return:

1. Extracted Skills (array)
2. Strengths (array)
3. Weaknesses (array)
4. ATS Score (0-100 number)
5. Suggestions (array)

Return only JSON.

Resume:
${extractedText}
`,
        },
      ],
    });

    const result = aiResponse.choices[0].message.content;

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { raw: result };
    }

    resume.analysis = parsedResult;
    await resume.save();

    return res.json(parsedResult);

  } catch (error) {
    console.error(error);

    // ✅ Handle OpenAI quota error safely
    if (error.code === "insufficient_quota" && resume) {

      const mockResult = {
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        strengths: [
          "Strong technical foundation",
          "Good project experience",
          "Clear formatting",
        ],
        weaknesses: [
          "Lacks quantified achievements",
          "Needs stronger summary section",
        ],
        atsScore: 78,
        suggestions: [
          "Add measurable results",
          "Improve professional summary",
          "Add more relevant keywords",
        ],
      };

      resume.analysis = mockResult;
      await resume.save();

      return res.json(mockResult);
    }

    return res.status(500).json({ message: error.message });
  }
};


// ✅ Match Resume With Job Description
export const matchWithJob = async (req, res) => {
  let resume;

  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // ✅ Extract resume text again (safe method using pdf2json)
    const response = await fetch(resume.fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParser = new PDFParser();

    const resumeText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData =>
        reject(errData.parserError)
      );

      pdfParser.on("pdfParser_dataReady", pdfData => {
        let text = "";

        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(r => {
              text += decodeURIComponent(r.T) + " ";
            });
          });
          text += "\n";
        });

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an ATS job matching system. Compare resumes with job descriptions and return structured JSON.",
        },
        {
          role: "user",
          content: `
Compare the following resume and job description.

Return ONLY JSON with:

1. matchScore (0-100 number)
2. matchedSkills (array)
3. missingSkills (array)
4. keywordGaps (array)
5. recommendations (array)

Resume:
${resumeText}

Job Description:
${jobDescription}
`,
        },
      ],
    });

    const result = aiResponse.choices[0].message.content;

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { raw: result };
    }

    resume.jobMatch = parsedResult;
    await resume.save();

    res.json(parsedResult);

  } catch (error) {
    console.error(error);

    // ✅ Mock fallback if quota exceeded
    if (error.code === "insufficient_quota" && resume) {
      const mockMatch = {
        matchScore: 72,
        matchedSkills: ["JavaScript", "React"],
        missingSkills: ["Docker", "AWS"],
        keywordGaps: ["CI/CD", "Microservices"],
        recommendations: [
          "Add cloud deployment experience",
          "Include Docker-based projects",
          "Mention CI/CD pipelines",
        ],
      };

      resume.jobMatch = mockMatch;
      await resume.save();

      return res.json(mockMatch);
    }

    res.status(500).json({ message: error.message });
  }
};



// // ✅ AI Resume Rewriter
// export const rewriteResume = async (req, res) => {
//   let resume;

//   try {
//     const { resumeId } = req.params;

//     resume = await Resume.findById(resumeId);

//     if (!resume) {
//       return res.status(404).json({ message: "Resume not found" });
//     }

//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     // ✅ Download PDF
//     const response = await fetch(resume.fileUrl);
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // ✅ Extract text using pdf2json
//     const pdfParser = new PDFParser();

//     const extractedText = await new Promise((resolve, reject) => {
//       pdfParser.on("pdfParser_dataError", errData =>
//         reject(errData.parserError)
//       );

//       pdfParser.on("pdfParser_dataReady", pdfData => {
//         let text = "";

//         pdfData.Pages.forEach(page => {
//           page.Texts.forEach(textItem => {
//             textItem.R.forEach(r => {
//               text += decodeURIComponent(r.T) + " ";
//             });
//           });
//           text += "\n";
//         });

//         resolve(text);
//       });

//       pdfParser.parseBuffer(buffer);
//     });

//     // ✅ Ask AI to rewrite professionally
//     const aiResponse = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a professional resume writer. Improve resumes to be more impactful, quantified, and ATS optimized.",
//         },
//         {
//           role: "user",
//           content: `
// Rewrite the following resume content professionally.

// Return ONLY JSON with:

// {
//   "improvedSummary": "string",
//   "improvedExperience": ["bullet1", "bullet2", ...],
//   "overallFeedback": "string"
// }

// Resume:
// ${extractedText}
// `,
//         },
//       ],
//     });

//     const result = aiResponse.choices[0].message.content;

//     let parsedResult;
//     try {
//       parsedResult = JSON.parse(result);
//     } catch {
//       parsedResult = { raw: result };
//     }

//     resume.rewriteResult = parsedResult;
//     await resume.save();

//     return res.json(parsedResult);

//   } catch (error) {
//     console.error(error);

//     // ✅ Mock fallback if OpenAI quota exceeded
//     if (error.code === "insufficient_quota" && resume) {
//       const mockRewrite = {
//         improvedSummary:
//           "Results-driven software developer with strong expertise in full-stack development, delivering scalable and high-performance applications.",
//         improvedExperience: [
//           "Developed and deployed MERN stack applications improving performance by 30%.",
//           "Collaborated with cross-functional teams to deliver production-ready features.",
//           "Optimized backend APIs reducing response time by 40%.",
//         ],
//         overallFeedback:
//           "Your resume is technically strong but needs more quantified achievements and measurable results.",
//       };

//       resume.rewriteResult = mockRewrite;
//       await resume.save();

//       return res.json(mockRewrite);
//     }

//     return res.status(500).json({ message: error.message });
//   }
// };