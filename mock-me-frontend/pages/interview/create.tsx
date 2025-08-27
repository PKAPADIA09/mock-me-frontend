import React from 'react';
import Head from 'next/head';
import CreateInterviewForm from '../../components/interview/CreateInterviewForm';

const CreateInterviewPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Interview - Mock-Me</title>
        <meta name="description" content="Create a new mock interview session" />
      </Head>
      <main>
        <CreateInterviewForm />
      </main>
    </>
  );
};

export default CreateInterviewPage;