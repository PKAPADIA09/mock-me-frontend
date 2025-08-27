import { Response } from 'express';
import { ResourceError } from "../../errors";
import { asyncHandler } from "../../shared/middleware/error.middleware";
import { EndInterviewRequest, EndInterviewResponse, GetNextQuestionRequest, GetNextQuestionResponse, StartVoiceInterviewRequest, StartVoiceInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse } from "./voiceInterview.types";
import { endVoiceInterview, getNextQuestion, startVoiceInterview, submitAnswer } from './voiceInterview.service';


export const startVoiceInterviewHandler = asyncHandler( async(
    req: StartVoiceInterviewRequest
    , res: Response<ResourceError | StartVoiceInterviewResponse>
): Promise<Response<ResourceError | StartVoiceInterviewResponse>> => {
 
    const startVoiceInterviewResult = await startVoiceInterview( req.body )

    if ( startVoiceInterviewResult.isError() ) {
        return res
            .status( startVoiceInterviewResult.value.statusCode )
            .json( startVoiceInterviewResult.value )
    }

    return res
        .status( 200 )
        .json( startVoiceInterviewResult.value )
} );


export const getNextQuestionHandler = asyncHandler( async(
    req: GetNextQuestionRequest
    , res: Response<ResourceError | GetNextQuestionResponse>
): Promise<Response<ResourceError | GetNextQuestionResponse>> => {

    const getNextQuestionResult = await getNextQuestion( req.params.sessionId );

    if ( getNextQuestionResult.isError() ) {
        return res
            .status( getNextQuestionResult.value.statusCode )
            .json( getNextQuestionResult.value )
    } 

    return res
        .status( 200 )
        .json( getNextQuestionResult.value )
} )


export const submitAnswerHandler = asyncHandler( async(
    req: SubmitAnswerRequest
    , res: Response<ResourceError | SubmitAnswerResponse>
): Promise<Response<ResourceError | SubmitAnswerResponse>> => {

    const { sessionId, questionId } = req.body as any;
    const file = (req as any).file as any | undefined;
    const audioFilePath = file?.path || '';

    const submitAnswerResult = await submitAnswer({
        sessionId,
        questionId: Number(questionId),
        audioFile: audioFilePath
    });

    if ( submitAnswerResult.isError() ) {
        // Delegate to global error handler by throwing
        throw submitAnswerResult.value;
    }

    return res
        .status( 200 )
        .json( submitAnswerResult.value )
} )


export const endVoiceInterviewHandler = asyncHandler(async (
    req: EndInterviewRequest,
    res: Response<ResourceError | EndInterviewResponse>
): Promise<Response<ResourceError | EndInterviewResponse>> => {
    
    const endResult = await endVoiceInterview(req.body.sessionId);

    if (endResult.isError()) {
        return res
            .status(endResult.value.statusCode)
            .json(endResult.value);
    }

    return res
        .status(200)
        .json(endResult.value);
});
