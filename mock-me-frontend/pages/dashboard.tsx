import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Sparkles, LogOut, Plus } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('mockme_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('mockme_user');
    localStorage.removeItem('mockme_token');
    router.push('/');
  };

  const handleCreateInterview = () => {
    console.log('Create Interview clicked!'); // Debug log
    router.push('/interview/create');
  };

  const handleViewHistory = () => {
    router.push('/interview/history');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Mock-Me</title>
        <meta name="description" content="Your Mock-Me dashboard" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Header */}
        <header className="p-6 border-b border-gray-800">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-teal-400 mr-3" />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">
                Mock-Me
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500 mb-4">
                Welcome back, {user.firstName}!
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Ready to ace your next interview? Lets get started with some practice sessions.
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Create Interview Card - Using button instead of Link */}
              <div className="p-6 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl hover:border-teal-400 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                   onClick={handleCreateInterview}>
                <div className="flex items-center mb-2">
                  <Plus className="w-6 h-6 text-teal-400 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-xl font-bold text-teal-400">Create Interview</h3>
                </div>
                <p className="text-gray-400 mb-4">Set up a new mock interview session</p>
                <div className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-sky-600 rounded-lg font-semibold text-center group-hover:from-teal-600 group-hover:to-sky-700 transition-all duration-200">
                  Start New Interview
                </div>
              </div>

              {/* Alternative version using Link - if you prefer this approach */}
              {/* 
              <Link href="/interview/create" legacyBehavior>
                <a className="p-6 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl hover:border-teal-400 transition-all duration-300 transform hover:scale-105 group">
                  <div className="flex items-center mb-2">
                    <Plus className="w-6 h-6 text-teal-400 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="text-xl font-bold text-teal-400">Create Interview</h3>
                  </div>
                  <p className="text-gray-400 mb-4">Set up a new mock interview session</p>
                  <div className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-sky-600 rounded-lg font-semibold text-center group-hover:from-teal-600 group-hover:to-sky-700 transition-all duration-200">
                    Start New Interview
                  </div>
                </a>
              </Link>
              */}

              <div className="p-6 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl hover:border-sky-400 transition-all duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-sky-400 mb-2">Past Interviews</h3>
                <p className="text-gray-400 mb-4">Review your previous sessions</p>
                <button onClick={handleViewHistory} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200">
                  View History
                </button>
              </div>
              {/* Analytics removed for now */}
            </div>

            {/* Journey stats removed for now */}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;