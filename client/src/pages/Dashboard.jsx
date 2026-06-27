import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../utils/axios";
import { motion } from "framer-motion";
import ScoreCircle from "../components/ScoreCircle";

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

  // ✅ Job Matching States
  const [jobModalId, setJobModalId] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchingId, setMatchingId] = useState(null);

  const fetchResumes = async () => {
    try {
      const { data } = await API.get("/resume/my");
      setResumes(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a PDF");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      await API.post("/resume/upload", formData);
      setFile(null);
      fetchResumes();
    } catch (error) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      setAnalyzingId(id);
      await API.post(`/resume/analyze/${id}`);
      fetchResumes();
    } catch (error) {
      alert("Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleMatch = async (id) => {
    if (!jobDescription) return alert("Paste job description");

    try {
      setMatchingId(id);
      await API.post(`/resume/match/${id}`, {
        jobDescription,
      });

      setJobDescription("");
      setJobModalId(null);
      fetchResumes();
    } catch (error) {
      alert("Job matching failed");
    } finally {
      setMatchingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user?.name} 👋
        </h1>

        {/* ✅ Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl mb-10">
          <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>

          <form onSubmit={handleUpload} className="flex gap-4 items-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="bg-indigo-600 px-6 py-2 rounded-lg">
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        {/* ✅ Resume List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>

          {resumes.length === 0 ? (
            <p>No resumes uploaded yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {resumes.map((resume) => (
                <motion.div
                  key={resume._id}
                  className="bg-gray-900 p-6 rounded-xl border border-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 className="font-semibold mb-2">
                    {resume.originalName}
                  </h3>

                  {/* ✅ Buttons */}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleAnalyze(resume._id)}
                      className="bg-purple-600 px-4 py-2 rounded-lg"
                    >
                      {analyzingId === resume._id
                        ? "Analyzing..."
                        : "Analyze"}
                    </button>

                    <button
                      onClick={() => setJobModalId(resume._id)}
                      className="bg-blue-600 px-4 py-2 rounded-lg"
                    >
                      Match With Job
                    </button>
                  </div>

                  {/* ✅ AI Analysis */}
                  {resume.analysis && (
                    <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                      <h4 className="font-semibold text-green-400">
                        ATS Score
                      </h4>
                      <ScoreCircle
                        score={resume.analysis.atsScore}
                        label="ATS Score"
                      />

                      <div>
                        <h5 className="font-semibold mt-2">
                          Skills
                        </h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resume.analysis.skills?.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-indigo-600 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Job Match Result */}
                  {resume.jobMatch && (
                    <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                      <h4 className="font-semibold text-blue-400">
                        Job Match Score
                      </h4>

                      <ScoreCircle
                        score={resume.jobMatch.matchScore}
                        label="Match Score"
                      />

                      <div>
                        <h5 className="text-green-400 font-semibold mt-2">
                          Matched Skills
                        </h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resume.jobMatch.matchedSkills?.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-green-600 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-red-400 font-semibold mt-2">
                          Missing Skills
                        </h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resume.jobMatch.missingSkills?.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-red-600 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-yellow-400 font-semibold mt-2">
                          Recommendations
                        </h5>
                        <ul className="list-disc list-inside text-sm mt-2">
                          {resume.jobMatch.recommendations?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Job Description Modal */}
      {jobModalId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-[500px]">
            <h3 className="text-lg font-semibold mb-4">
              Paste Job Description
            </h3>

            <textarea
              rows="6"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setJobModalId(null)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => handleMatch(jobModalId)}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                {matchingId === jobModalId
                  ? "Matching..."
                  : "Match"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




// ✅ For Adding Resume Rewrite feature then dashboard code is

// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import { useAuth } from "../context/AuthContext";
// import API from "../utils/axios";
// import { motion } from "framer-motion";
// import ScoreCircle from "../components/ScoreCircle";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [resumes, setResumes] = useState([]);
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [analyzingId, setAnalyzingId] = useState(null);
//   const [matchingId, setMatchingId] = useState(null);
//   const [rewritingId, setRewritingId] = useState(null);

//   const [jobModalId, setJobModalId] = useState(null);
//   const [jobDescription, setJobDescription] = useState("");

//   const fetchResumes = async () => {
//     try {
//       const { data } = await API.get("/resume/my");
//       setResumes(data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchResumes();
//   }, []);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!file) return alert("Select a PDF");

//     const formData = new FormData();
//     formData.append("resume", file);

//     try {
//       setLoading(true);
//       await API.post("/resume/upload", formData);
//       setFile(null);
//       fetchResumes();
//     } catch {
//       alert("Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnalyze = async (id) => {
//     try {
//       setAnalyzingId(id);
//       await API.post(`/resume/analyze/${id}`);
//       fetchResumes();
//     } catch {
//       alert("Analysis failed");
//     } finally {
//       setAnalyzingId(null);
//     }
//   };

//   const handleMatch = async (id) => {
//     if (!jobDescription) return alert("Paste job description");

//     try {
//       setMatchingId(id);
//       await API.post(`/resume/match/${id}`, { jobDescription });
//       setJobDescription("");
//       setJobModalId(null);
//       fetchResumes();
//     } catch {
//       alert("Job matching failed");
//     } finally {
//       setMatchingId(null);
//     }
//   };

//   const handleRewrite = async (id) => {
//     try {
//       setRewritingId(id);
//       await API.post(`/resume/rewrite/${id}`);
//       fetchResumes();
//     } catch {
//       alert("Rewrite failed");
//     } finally {
//       setRewritingId(null);
//     }
//   };

//   return (
//     <>
//       <Navbar />

//       <div className="p-10 max-w-6xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6">
//           Welcome, {user?.name} 👋
//         </h1>

//         {/* Upload Section */}
//         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl mb-10">
//           <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
//           <form onSubmit={handleUpload} className="flex gap-4 items-center">
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//             <button className="bg-indigo-600 px-6 py-2 rounded-lg">
//               {loading ? "Uploading..." : "Upload"}
//             </button>
//           </form>
//         </div>

//         {/* Resume List */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {resumes.map((resume) => (
//             <motion.div
//               key={resume._id}
//               className="bg-gray-900 p-6 rounded-xl border border-gray-800"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             >
//               <h3 className="font-semibold mb-3">
//                 {resume.originalName}
//               </h3>

//               <div className="flex flex-wrap gap-3 mb-4">
//                 <button
//                   onClick={() => handleAnalyze(resume._id)}
//                   className="bg-purple-600 px-4 py-2 rounded-lg"
//                 >
//                   {analyzingId === resume._id
//                     ? "Analyzing..."
//                     : "Analyze"}
//                 </button>

//                 <button
//                   onClick={() => setJobModalId(resume._id)}
//                   className="bg-blue-600 px-4 py-2 rounded-lg"
//                 >
//                   Match Job
//                 </button>

//                 <button
//                   onClick={() => handleRewrite(resume._id)}
//                   className="bg-green-600 px-4 py-2 rounded-lg"
//                 >
//                   {rewritingId === resume._id
//                     ? "Rewriting..."
//                     : "Rewrite"}
//                 </button>
//               </div>

//               {/* ATS Score */}
//               {resume.analysis && (
//                 <ScoreCircle
//                   score={resume.analysis.atsScore}
//                   label="ATS Score"
//                 />
//               )}

//               {/* Job Match */}
//               {resume.jobMatch && (
//                 <div className="mt-6">
//                   <ScoreCircle
//                     score={resume.jobMatch.matchScore}
//                     label="Match Score"
//                   />
//                 </div>
//               )}

//               {/* Rewrite Result */}
//               {resume.rewriteResult && (
//                 <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
//                   <h4 className="font-semibold text-green-400">
//                     Improved Summary
//                   </h4>
//                   <p className="text-sm">
//                     {resume.rewriteResult.improvedSummary}
//                   </p>

//                   <h4 className="font-semibold text-blue-400 mt-4">
//                     Improved Experience
//                   </h4>
//                   <ul className="list-disc list-inside text-sm">
//                     {resume.rewriteResult.improvedExperience?.map(
//                       (item, i) => (
//                         <li key={i}>{item}</li>
//                       )
//                     )}
//                   </ul>

//                   <h4 className="font-semibold text-yellow-400 mt-4">
//                     Overall Feedback
//                   </h4>
//                   <p className="text-sm">
//                     {resume.rewriteResult.overallFeedback}
//                   </p>
//                 </div>
//               )}
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Job Description Modal */}
//       {jobModalId && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
//           <div className="bg-gray-900 p-6 rounded-xl w-[500px]">
//             <h3 className="text-lg font-semibold mb-4">
//               Paste Job Description
//             </h3>

//             <textarea
//               rows="6"
//               value={jobDescription}
//               onChange={(e) => setJobDescription(e.target.value)}
//               className="w-full p-3 rounded bg-gray-800 mb-4"
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setJobModalId(null)}
//                 className="px-4 py-2 bg-gray-600 rounded"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => handleMatch(jobModalId)}
//                 className="px-4 py-2 bg-blue-600 rounded"
//               >
//                 {matchingId === jobModalId
//                   ? "Matching..."
//                   : "Match"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }