import React from 'react';
import Head from 'next/head';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login - Mock-Me</title>
        <meta name="description" content="Sign in to Mock-Me" />
      </Head>
      <main>
        <LoginForm/>
      </main>
    </>
  );
};

export default LoginPage;