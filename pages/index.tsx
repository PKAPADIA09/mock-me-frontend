import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Mock-Me - Interview Preparation Platform</title>
        <meta name="description" content="Your personalized platform for interview preparation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-teal-400 mr-4 animate-spin" />
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-purple-400 animate-pulse">
              Mock-Me
            </h1>
          </div>
          
          <p className="text-2xl text-gray-300 mb-4 leading-relaxed">
            Your personalized platform for interview preparation
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Practice with AI-powered mock interviews, get real-time feedback, and land your dream job with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/login" legacyBehavior>
              <a className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-sky-600 text-white rounded-2xl shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 font-bold text-lg min-w-[150px] text-center">
                <span className="relative z-10">Log In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-sky-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </Link>
            
            <Link href="/signup" legacyBehavior>
              <a className="group relative px-8 py-4 bg-gray-800 text-white rounded-2xl shadow-2xl border-2 border-gray-700 hover:border-teal-400 transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 font-bold text-lg min-w-[150px] text-center">
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-sky-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;