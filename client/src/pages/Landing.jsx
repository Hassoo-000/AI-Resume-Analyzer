import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Navbar */}
      <div className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-indigo-500">
          ResumeAI Pro
        </h1>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 rounded-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gray-700 rounded-lg"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mt-20 px-6">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold leading-tight max-w-4xl"
        >
          AI-Powered Resume Analyzer & Job Matching Platform
        </motion.h2>

        <p className="mt-6 text-gray-400 max-w-2xl text-lg">
          Improve your resume, optimize ATS score, match with job descriptions,
          and rewrite your resume professionally using AI.
        </p>

        <div className="mt-8 flex gap-6">
          <Link
            to="/register"
            className="px-8 py-3 bg-indigo-600 rounded-xl text-lg font-semibold"
          >
            Get Started Free
          </Link>

          <Link
            to="/login"
            className="px-8 py-3 border border-gray-600 rounded-xl text-lg"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-32 px-10 grid md:grid-cols-3 gap-10 text-center">

        <div className="bg-gray-900 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">
            ATS Score Analysis
          </h3>
          <p className="text-gray-400">
            Get real-time ATS scoring with AI-powered suggestions to improve
            your resume instantly.
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">
            Job Description Matching
          </h3>
          <p className="text-gray-400">
            Compare your resume with job descriptions and identify missing
            skills & keyword gaps.
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">
            AI Resume Rewriter
          </h3>
          <p className="text-gray-400">
            Rewrite your resume professionally with quantified achievements
            and impactful bullet points.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-32 text-center text-gray-500 pb-10">
        © 2026 ResumeAI Pro — Built with MERN & OpenAI
      </div>
    </div>
  );
}