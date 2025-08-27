import { asyncHandler } from "../../shared/middleware/error.middleware";
import { Response } from 'express';
import { ResourceError } from "../../errors";
import { CreateInterviewRequest, CreateInterviewResponse, GetInterviewByIdRequest, Interview } from "./interviews.types";
import { createInterview, getInterviewById, listInterviews, getInterviewQuestions } from "./interviews.service";

export const createInterviewHandler = asyncHandler( async(
    req: CreateInterviewRequest
    , res: Response<ResourceError | CreateInterviewResponse>
): Promise<Response<ResourceError | CreateInterviewResponse>> => {
    
    const createInterviewResult = await createInterview( req.body );

    if ( createInterviewResult.isError() ) {
        return res
            .status( createInterviewResult.value.statusCode )
            .json( createInterviewResult.value )
    }

    return res
        .status( 201 )
        .json( createInterviewResult.value )
} )


// Add this to interviews.ctrl.ts
export const getInterviewByIdHandler = asyncHandler( async(
    req: GetInterviewByIdRequest,
    res: Response<ResourceError | Interview>
): Promise<Response<ResourceError | Interview>> => {
    
    const interviewId = parseInt(req.params.id);
    
    if (isNaN(interviewId)) {
        return res.status(400).json();
    }

    const getInterviewResult = await getInterviewById(interviewId);

    if (getInterviewResult.isError()) {
        return res
            .status(getInterviewResult.value.statusCode || 500)
            .json(getInterviewResult.value);
    }

    return res
        .status(200)
        .json(getInterviewResult.value);
});


export const listInterviewsHandler = asyncHandler(async (
    req: any,
    res: Response<ResourceError | Interview[]>
): Promise<Response<ResourceError | Interview[]>> => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
        return res.status(400).json();
    }

    const listResult = await listInterviews(userId);
    if (listResult.isError()) {
        return res
            .status(listResult.value.statusCode)
            .json(listResult.value);
    }

    return res.status(200).json(listResult.value);
});


export const getInterviewQuestionsHandler = asyncHandler(async (
    req: GetInterviewByIdRequest,
    res: Response
) => {
    const interviewId = parseInt(req.params.id);

    if (isNaN(interviewId)) {
        return res.status(400).json();
    }

    const questionsResult = await getInterviewQuestions(interviewId);
    if (questionsResult.isError()) {
        return res
            .status(questionsResult.value.statusCode)
            .json(questionsResult.value);
    }

    return res.status(200).json(questionsResult.value.sort((a, b) => a.questionOrder - b.questionOrder));
});