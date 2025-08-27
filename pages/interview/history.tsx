import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Calendar, Hash, Building } from 'lucide-react';
import { Interview } from '../../types/interview';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const InterviewHistoryPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('mockme_user');
    if (!userData) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }
    const user = JSON.parse(userData) as { id: number };
    fetchInterviews(user.id);
  }, []);

  const fetchInterviews = async (userId: number) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/interview?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch interviews');
      const data: Interview[] = await res.json();
      setInterviews(data);
    } catch (e) {
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Past Interviews - Mock-Me</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard" legacyBehavior>
              <a className="flex items-center text-teal-400 hover:text-sky-400 transition-colors duration-200 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </a>
            </Link>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">Past Interviews</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : interviews.length === 0 ? (
            <div className="text-center text-gray-400">No interviews yet. Create one to get started!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((i) => (
                <Link key={i.id} href={`/interview/${i.id}`} legacyBehavior>
                  <a className="p-5 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl hover:border-teal-400 transition-all duration-300">
                    <div className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-teal-400" />
                      {i.companyName}
                    </div>
                    <div className="text-gray-300 mb-2">{i.role} • {i.level}</div>
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Hash className="w-4 h-4 mr-1 text-teal-400" /> {i.numberOfQuestions} questions
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1 text-sky-400" /> {new Date(i.createdAt).toLocaleDateString()}
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InterviewHistoryPage;


