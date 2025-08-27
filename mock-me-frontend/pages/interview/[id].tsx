import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Building, Calendar, Hash, Tag, Target, CheckCircle, PlayCircle, Globe, FileText, X } from 'lucide-react';
import { Interview } from '../../types/interview';
import VoiceInterview from '../../components/interview/VoiceInterview';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const InterviewDetailPage: React.FC = () => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showVoiceInterview, setShowVoiceInterview] = useState<boolean>(false);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<Array<{ id: number; interviewId: number; question: string; answer: string; feedback?: string; questionOrder: number }>>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInterview();
    }
  }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/interview/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview');
      }

      const data: Interview = await response.json();
      setInterview(data);
    } catch (err) {
      setError('Failed to load interview details');
      console.error('Error fetching interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsWithAnswers = async () => {
    try {
      const interviewIdParam = interview?.id ?? (Array.isArray(id) ? Number(id[0]) : Number(id));
      if (!interviewIdParam) return;
      setQuestionsLoading(true);
      const response = await fetch(`${backendUrl}/api/v1/interview/${interviewIdParam}/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestionsWithAnswers(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (interviewCompleted && interview) {
      fetchQuestionsWithAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewCompleted, interview?.id]);

  // Fetch questions/answers once the interview is loaded, regardless of completion
  useEffect(() => {
    if (interview) {
      fetchQuestionsWithAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview?.id]);

  const handleStartInterview = () => {
    setShowVoiceInterview(true);
  };

  const handleInterviewComplete = () => {
    setShowVoiceInterview(false);
    setInterviewCompleted(true);
    // Done: rely on banner only
  };

  const handleCloseVoiceInterview = () => {
    setShowVoiceInterview(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-gray-300 mb-6">{error}</p>
        <Link href="/dashboard" legacyBehavior>
          <a className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors duration-200">
            Back to Dashboard
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{interview.role} Interview - Mock-Me</title>
        <meta name="description" content={`Mock interview for ${interview.role} at ${interview.companyName}`} />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" legacyBehavior>
              <a className="flex items-center text-teal-400 hover:text-sky-400 transition-colors duration-200 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </a>
            </Link>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500 mb-2">
                  {interview.role}
                </h1>
                <p className="text-xl text-gray-300 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  {interview.companyName}
                </p>
              </div>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl px-6 py-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-green-300 font-semibold">Interview Ready</span>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-teal-400 mb-4">Interview Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                    <p className="text-white font-semibold flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-teal-400" />
                      {interview.role}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Level</label>
                    <p className="text-white font-semibold">{interview.level}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Questions</label>
                    <p className="text-white font-semibold flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-teal-400" />
                      {interview.numberOfQuestions}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Created</label>
                    <p className="text-white font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-teal-400" />
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              {interview.techStack && interview.techStack.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interview.techStack.map(tech => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-teal-600/20 border border-teal-500/30 rounded-lg text-teal-300 text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Focus */}
              {interview.interviewFocus && interview.interviewFocus.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Interview Focus
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {interview.interviewFocus.map(focus => (
                      <span
                        key={focus}
                        className="px-3 py-2 bg-sky-600/20 border border-sky-500/30 rounded-lg text-sky-300 text-sm text-center"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Job Description
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap bg-gray-800/50 rounded-xl p-4 max-h-60 overflow-y-auto">
                  {interview.jobDescription}
                </div>
              </div>

              {/* Interview Questions */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-200">Generated Questions</h3>
                  {(interviewCompleted || questionsWithAnswers.length > 0) && (
                    <button onClick={fetchQuestionsWithAnswers} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg">Refresh</button>
                  )}
                </div>
                {!(interviewCompleted || questionsWithAnswers.length > 0) ? (
                  <p className="text-gray-400">Questions will appear here after you finish the interview.</p>
                ) : (
                  <div className="space-y-3">
                    {questionsLoading && (
                      <div className="text-gray-400">Loading questions and answers...</div>
                    )}
                    {!questionsLoading && questionsWithAnswers.length === 0 && (
                      <div className="text-gray-400">No answers were captured.</div>
                    )}
                    {!questionsLoading && questionsWithAnswers
                      .sort((a, b) => a.questionOrder - b.questionOrder)
                      .map((q) => (
                      <div key={q.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="text-gray-200">
                            <span className="text-teal-400 font-semibold">Q{q.questionOrder}: </span>
                            {q.question}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-sky-400 font-semibold">Answer: </span>
                          <span className="text-gray-300">{q.answer || '—'}</span>
                        </div>
                        {q.feedback && q.feedback.trim() !== '' && (
                          <div className="mt-2 text-sm">
                            <span className="text-emerald-400 font-semibold">Feedback: </span>
                            {q.feedback.trim() === 'Loved the answer! You Killed It!' ? (
                              <span className="text-gray-300">{q.feedback.trim()}</span>
                            ) : (
                              <ol className="mt-2 ml-5 list-decimal text-gray-300">
                                {q.feedback
                                  .split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0)
                                  .map((line, idx) => {
                                    const cleaned = line.replace(/^([*\-•\u2022])\s*/, '');
                                    return (
                                      <li key={idx}>{cleaned}</li>
                                    );
                                  })}
                              </ol>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Start Interview */}
              {questionsWithAnswers.every(q => !q.answer || q.answer.trim() === '') && (
                <div className="bg-gradient-to-br from-teal-600/20 to-sky-600/20 border border-teal-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Ready to Practice?</h3>
                  <p className="text-gray-300 mb-6">
                    Your interview questions are ready. Start practicing now!
                  </p>
                  <button 
                    onClick={handleStartInterview}
                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <PlayCircle className="w-6 h-6 mr-3" />
                    Start Voice Interview
                  </button>
                </div>
              )}

              {/* Company Info */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                    <p className="text-white font-semibold">{interview.companyName}</p>
                  </div>
                  {interview.companyWebsite && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                      <a 
                        href={interview.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-sky-400 transition-colors duration-200 flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-200 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200 text-left">
                    📝 Take Notes
                  </button>
                  <button className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200 text-left">
                    📊 View Analytics
                  </button>
                  <button className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg font-semibold transition-all duration-200 text-left text-red-300">
                    🗑️ Delete Interview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Interview Modal */}
          {showVoiceInterview && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <VoiceInterview 
                  interviewId={interview.id} 
                  onComplete={handleInterviewComplete}
                  onClose={handleCloseVoiceInterview}
                />
              </div>
            </div>
          )}

          {/* Completion Banner */}
          {interviewCompleted && !showVoiceInterview && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <div className="px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 shadow-lg">
                Interview completed successfully! Great job!
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InterviewDetailPage;