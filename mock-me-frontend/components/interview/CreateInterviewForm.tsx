import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Briefcase, Building, Globe, Hash, FileText, Target, Plus, X } from 'lucide-react';
import { CreateInterviewRequest, InterviewFocusType, InterviewLevel, CreateInterviewResponse, ApiErrorResponse } from '../../types/interview';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const CreateInterviewForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<CreateInterviewRequest, 'userId'>>({
    role: '',
    level: 'Mid Level',
    techStack: [],
    numberOfQuestions: 10,
    companyName: '',
    jobDescription: '',
    companyWebsite: '',
    interviewFocus: [],
  });
  
  const [currentTech, setCurrentTech] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const interviewLevels: InterviewLevel[] = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', 'Executive'
  ];

  const focusOptions: InterviewFocusType[] = [
    'Behavioral', 'Situational', 'Experience-Based', 'Technical', 'Problem-Solving', 'Leadership', 'Cultural-Fit'
  ];

  const handleInputChange = (field: keyof Omit<CreateInterviewRequest, 'userId' | 'techStack' | 'interviewFocus'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTechStack = () => {
    if (currentTech.trim() && !formData.techStack?.includes(currentTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), currentTech.trim()]
      }));
      setCurrentTech('');
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack?.filter(t => t !== tech) || []
    }));
  };

  const toggleFocus = (focus: InterviewFocusType) => {
    setFormData(prev => ({
      ...prev,
      interviewFocus: prev.interviewFocus?.includes(focus)
        ? prev.interviewFocus.filter(f => f !== focus)
        : [...(prev.interviewFocus || []), focus]
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('mockme_user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const requestBody: CreateInterviewRequest = {
        ...formData,
        userId: user.id
      };

      const response = await fetch(`${backendUrl}/api/v1/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message || 'Failed to create interview');
      }

      const data: CreateInterviewResponse = await response.json();
      console.log('Interview created successfully:', data);
      
      // Redirect to interview details or dashboard
      router.push(`/interview/${data.id}`);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" legacyBehavior>
            <a className="flex items-center text-teal-400 hover:text-sky-400 transition-colors duration-200 mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </a>
          </Link>
          
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500 mb-4">
            Create Mock Interview
          </h1>
          <p className="text-xl text-gray-300">
            Set up your personalized interview practice session
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Role */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <Briefcase className="w-5 h-5 inline mr-2" />
                  Role/Position
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Frontend Developer, Product Manager"
                  required
                />
              </div>

              {/* Level */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  Experience Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  {interviewLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Company Info */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <Building className="w-5 h-5 inline mr-2" />
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  required
                />
              </div>

              {/* Company Website */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <Globe className="w-5 h-5 inline mr-2" />
                  Company Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://company.com"
                />
              </div>

              {/* Number of Questions */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <Hash className="w-5 h-5 inline mr-2" />
                  Number of Questions
                </label>
                <select
                  value={formData.numberOfQuestions}
                  onChange={(e) => handleInputChange('numberOfQuestions', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  {[5, 10, 15, 20, 25, 30].map(num => (
                    <option key={num} value={num}>{num} Questions</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Tech Stack */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  Tech Stack (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTech}
                    onChange={(e) => setCurrentTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                    className="flex-1 px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., React, Python, AWS"
                  />
                  <button
                    type="button"
                    onClick={addTechStack}
                    className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack?.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-teal-600/20 border border-teal-500/30 rounded-lg text-teal-300 text-sm flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechStack(tech)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview Focus */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <Target className="w-5 h-5 inline mr-2" />
                  Interview Focus (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {focusOptions.map(focus => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => toggleFocus(focus)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                        formData.interviewFocus?.includes(focus)
                          ? 'bg-teal-600/20 border-teal-500 text-teal-300'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Paste the job description here or describe the role requirements..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-4 rounded-2xl shadow-2xl text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-teal-500/25 ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Interview...
                </span>
              ) : (
                'Create Mock Interview'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewForm;