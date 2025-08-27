import { DatabaseQueryError } from "../../db/db.errors";
import { CreateInterviewRequest, Interview, GeminiResponse, InterviewQuestion, CreateInterviewQuestionResponse } from "./interviews.types";
import { success, Either, error } from "../../types/either";
import { query } from '../../db/db.query';

export const createInterview = async(
    interview: CreateInterviewRequest['body']
): Promise<Either<DatabaseQueryError, Interview>> => {

    const text = `
        INSERT INTO interviews(
            role
            , level
            , tech_stack
            , number_of_questions
            , company_name
            , job_description
            , company_website
            , interview_focus
            , user_id
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
        RETURNING id
            , role
            , level
            , tech_stack
            , number_of_questions
            , company_name
            , job_description
            , company_website
            , interview_focus
            , user_id
            , created_at
    `

    const values = [
        interview.role
        , interview.level
        , interview.techStack
        , interview.numberOfQuestions
        , interview.companyName
        , interview.jobDescription
        , interview.companyWebsite
        , interview.interviewFocus
        , interview.userId
    ]

    const queryResult = await query<Interview[]>({ text, values });

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }

    const [ createdInterview ] = queryResult.value;

    const prompt = buildGeminiPrompt( interview );
    const generatedQuestion = await getGeminiQuestions(prompt);

    for ( let i = 0; i < generatedQuestion.length; i++ ) {

        const question = generatedQuestion[ i ];

        await createInterviewQuestions( { 
            interviewId: createdInterview.id
            , question: question
            , answer: ''
            , questionOrder: i + 1
        } )
    }

    return success( createdInterview );
};

export const updateInterviewQuestionAnswer = async(
    questionId: number,
    answer: string
): Promise<Either<DatabaseQueryError, { success: boolean }>> => {
    
    const text = `
        UPDATE interview_questions
        SET answer = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
    `;

    const values = [questionId, answer];

    const queryResult = await query<Array<{ id: number }>>({ text, values });

    if (queryResult.isError()) {
        return error(queryResult.value);
    }

    return success( { success: true } );
};

export const updateInterviewQuestionFeedback = async(
    questionId: number,
    feedback: string
): Promise<Either<DatabaseQueryError, { success: boolean }>> => {
    const text = `
        UPDATE interview_questions
        SET feedback = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
    `;
    const values = [questionId, feedback];
    const queryResult = await query<Array<{ id: number }>>({ text, values });
    if (queryResult.isError()) {
        return error(queryResult.value);
    }
    return success({ success: true });
};

// Helper function to build the prompt for Gemini.
const buildGeminiPrompt = (data: CreateInterviewRequest['body']): string => {
    // ... (logic to build a prompt)
    const { role, level, techStack, numberOfQuestions, interviewFocus, companyName, jobDescription } = data;

    let prompt = `You are an expert interviewer. Generate a list of exactly ${numberOfQuestions} interview questions.`;
  
    if (role) prompt += ` The role is for a ${level} ${role}.`;
    if (techStack && techStack.length > 0) prompt += ` The tech stack is ${techStack.join(', ')}.`;
    if (companyName) prompt += ` The company name is ${companyName}.`;
    if (jobDescription) prompt += ` The job description is as follows: ${jobDescription}.`;
    if (interviewFocus && interviewFocus.length > 0) prompt += ` Focus on the following types of questions: ${interviewFocus.join(', ')}.`;
  
    prompt += `
IMPORTANT: Return ONLY the questions, one per line, numbered 1-${numberOfQuestions}. No introduction, no explanations, no additional text.

Format:
1. [Question 1]
2. [Question 2]
3. [Question 3]
...

Do not include any prefixes like "Problem-Solving:" or "Technical:" in the questions themselves.`;
    return prompt;
};

// Helper function to call the Gemini API.
const getGeminiQuestions = async (prompt: string): Promise<string[]> => {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "text/plain",
        },
    };

    try {
        const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json() as GeminiResponse;

        if (result.candidates && result.candidates.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            return text.split('\n').filter(q => q.trim() !== '').map(q => q.replace(/^\d+\.\s*/, '').trim());
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to generate interview questions.');
    }

    return [];
};

export const buildGeminiFeedbackPrompt = (context: {
    role: string;
    level: string;
    companyName: string;
    jobDescription: string;
    interviewFocus?: string[];
    question: string;
    answer: string;
}): string => {
    const { role, level, companyName, jobDescription, interviewFocus, question, answer } = context;
    let prompt = `You are an expert interviewer for a ${level} ${role} role at ${companyName}.
Provide a short, actionable feedback (2-4 bullet points max) on the candidate's answer.
Keep it specific to the question and the job description below.
If the answer is excellent and covers key points succinctly, respond with exactly: "Loved the answer! You Killed It!".

Question:
${question}

Answer:
${answer}

Job Description:
${jobDescription}
`;
    if (interviewFocus && interviewFocus.length > 0) {
        prompt += `\nFocus areas: ${interviewFocus.join(', ')}`;
    }
    prompt += `\nDo not include any preface; return only the feedback text.`;
    return prompt;
};

export const getGeminiFeedback = async (prompt: string): Promise<string> => {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'text/plain' },
    };
    const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to generate feedback with Gemini');
    }
    const result = await response.json() as GeminiResponse;
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return (text || '').trim();
};

export const generateAndSaveFeedbackForQuestion = async (
    questionId: number,
    answer: string
): Promise<void> => {
    // Get interview metadata via questionId
    const metaResult = await query<Array<{ role: string; level: string; company_name: string; job_description: string; interview_focus: string[] }>>({
        text: `
            SELECT i.role, i.level, i.company_name, i.job_description, i.interview_focus, q.question
            FROM interviews i
            JOIN interview_questions q ON q.interview_id = i.id
            WHERE q.id = $1
        `,
        values: [questionId]
    });

    if (metaResult.isError() || metaResult.value.length === 0) return;

    const meta = metaResult.value[0] as any;
    const prompt = buildGeminiFeedbackPrompt({
        role: meta.role,
        level: meta.level,
        companyName: meta.companyName,
        jobDescription: meta.jobDescription,
        interviewFocus: meta.interviewFocus,
        question: meta.question,
        answer,
    });

    const feedback = await getGeminiFeedback(prompt);
    if (feedback) {
        await updateInterviewQuestionFeedback(questionId, feedback);
    }
};

export const createInterviewQuestions = async(
    interviewQuestions: InterviewQuestion
): Promise<Either<DatabaseQueryError, CreateInterviewQuestionResponse>> => {

    const text = `
        INSERT INTO interview_questions (
            interview_id
            , question
            , answer
            , question_order
        ) VALUES ( $1, $2, $3, $4 )
        RETURNING id
            , interview_id
            , question
            , answer
            , feedback
            , question_order
    `;

    const values = [
        interviewQuestions.interviewId
        , interviewQuestions.question
        , interviewQuestions.answer
        , interviewQuestions.questionOrder
    ]

    const queryResult = await query<CreateInterviewQuestionResponse[]>({ text, values })

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }

    const [ createdInterviewQuestion ] = queryResult.value;

    return success( createdInterviewQuestion )
}


export const getInterviewQuestions = async(
    interviewId: InterviewQuestion['interviewId']
): Promise<Either<DatabaseQueryError, CreateInterviewQuestionResponse[]>> => {

    const text = `
        SELECT 
            id
            , interview_id
            , question
            , answer
            , feedback
            , question_order
        FROM interview_questions
        WHERE interview_id = $1
    `;

    const values = [ interviewId ]

    const queryResult = await query<CreateInterviewQuestionResponse[]>({ text, values })

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }

    const getInterviewQuestion = queryResult.value;

    return success( getInterviewQuestion )
}


// Add this to interviews.service.ts
export const getInterviewById = async(
    interviewId: number
): Promise<Either<DatabaseQueryError, Interview>> => {
    const text = `
        SELECT 
            id,
            role,
            level,
            tech_stack,
            number_of_questions,
            company_name,
            job_description,
            company_website,
            interview_focus,
            user_id,
            created_at
        FROM interviews
        WHERE id = $1
    `;

    const values = [interviewId];

    const queryResult = await query<Interview[]>({ text, values });

    if (queryResult.isError()) {
        return error(queryResult.value);
    }

    const [ interview ] = queryResult.value;

    // Get the generated questions for this interview
    const questionsResult = await getInterviewQuestions(interviewId);
    if (questionsResult.isSuccess()) {
        interview.interviewQuestions = questionsResult.value.map(q => q.question);
    } else {
        interview.interviewQuestions = [];
    }

    return success(interview);
};


export const listInterviews = async (
    userId: number
): Promise<Either<DatabaseQueryError, Interview[]>> => {
    const text = `
        SELECT 
            id,
            role,
            level,
            tech_stack,
            number_of_questions,
            company_name,
            job_description,
            company_website,
            interview_focus,
            user_id,
            created_at
        FROM interviews
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;

    const values = [userId];

    const queryResult = await query<Interview[]>({ text, values });
    if (queryResult.isError()) {
        return error(queryResult.value);
    }

    return success(queryResult.value);
}