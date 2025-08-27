import React from 'react';
import Head from 'next/head';
import SignUpForm from '@/components/auth/SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign Up - Mock-Me</title>
        <meta name="description" content="Create your Mock-Me account" />
      </Head>
      <main>
        <SignUpForm/>
      </main>
    </>
  );
};

export default SignUpPage;