import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, X } from 'lucide-react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

interface VoiceInterviewProps {
  interviewId: number;
  onComplete: () => void;
  onClose: () => void;
}

interface VoiceSession {
  sessionId: string;
  greetingMessage: string;
  greetingAudio: string;
}

interface Question {
  questionId: number;
  question: string;
  questionAudio: string;
  questionNumber: number;
  totalQuestions: number;
  isLastQuestion: boolean;
}

const VoiceInterview: React.FC<VoiceInterviewProps> = ({ interviewId, onComplete, onClose }) => {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const hasStartedRef = useRef(false); // ADDED: Prevent double initialization

  useEffect(() => {
    // CHANGED: Prevent double calls in React development mode
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startInterview();
    }
    
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [interviewId]);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  const speakWithBrowserTTS = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return resolve();
        const utter = new SpeechSynthesisUtterance(text);
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        synth.speak(utter);
      } catch {
        resolve();
      }
    });
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      setError(''); // ADDED: Clear any previous errors
      
      const userData = localStorage.getItem('mockme_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      const response = await fetch(`${backendUrl}/api/v1/voice-interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        },
        body: JSON.stringify({ interviewId, userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to start interview');

      const sessionData: VoiceSession = await response.json();
      setSession(sessionData);
      
      // Ensure greeting plays before proceeding. Fallback to browser TTS if audio missing or blocked
      const greetUrl = sessionData.greetingAudio ? `${backendUrl}${sessionData.greetingAudio}` : '';
      let greeted = false;
      if (greetUrl) {
        try {
          await playAudio(greetUrl);
          greeted = true;
        } catch (audioError) {
          console.warn('Greeting audio failed to play, trying browser TTS:', audioError);
        }
      }
      if (!greeted) {
        await speakWithBrowserTTS(sessionData.greetingMessage);
      }
      
      // Get first question
      await getNextQuestion(sessionData.sessionId);
    } catch (err) {
      setError('Failed to start interview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestion = async (sessionId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/voice-interview/${sessionId}/next-question`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No more questions, end interview
          await endInterview(sessionId);
          return;
        }
        throw new Error('Failed to get question');
      }

      const questionData: Question = await response.json();
      setCurrentQuestion(questionData);
      
      // Try to play question audio; fallback to browser TTS if missing or blocked
      const qUrl = questionData.questionAudio ? `${backendUrl}${questionData.questionAudio}` : '';
      let spoken = false;
      if (qUrl) {
        try {
          await playAudio(qUrl);
          spoken = true;
        } catch (audioError) {
          console.warn('Question audio failed to play, trying browser TTS:', audioError);
        }
      }
      if (!spoken) {
        await speakWithBrowserTTS(questionData.question);
      }
    } catch (err) {
      setError('Failed to get next question');
      console.error(err);
    }
  };

  const playAudio = async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current) {
        console.error('Audio element not found');
        reject(new Error('Audio element not found'));
        return;
      }

      console.log('Attempting to play audio:', audioUrl);
      setIsPlayingAudio(true);
      
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = audioUrl;
      
      audioRef.current.onloadeddata = () => {
        console.log('Audio loaded successfully');
      };
      
      audioRef.current.onended = () => {
        console.log('Audio playback ended');
        setIsPlayingAudio(false);
        resolve();
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlayingAudio(false);
        reject(new Error('Failed to play audio'));
      };

      // Try to play with better error handling
      audioRef.current.play()
        .then(() => {
          console.log('Audio playback started successfully');
        })
        .catch((error) => {
          console.error('Audio play failed:', error);
          setIsPlayingAudio(false);
          
          // If autoplay is blocked, just resolve and continue
          if (error.name === 'NotAllowedError') {
            console.log('Audio autoplay blocked, continuing without audio');
            resolve();
          } else {
            reject(error);
          }
        });
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording. Please allow microphone access.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        await submitAnswer(audioBlob);
      };
    }
  };

  const submitAnswer = async (audioBlob: Blob) => {
    if (!session || !currentQuestion) return;

    try {
      setLoading(true);
      
      // Create form data with audio file
      const formData = new FormData();
      formData.append('sessionId', session.sessionId);
      formData.append('questionId', currentQuestion.questionId.toString());
      formData.append('audioFile', audioBlob, 'answer.mp3');

      const response = await fetch(`${backendUrl}/api/v1/voice-interview/submit-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const result = await response.json();
      
      if (result.nextQuestionAvailable) {
        await getNextQuestion(session.sessionId);
      } else {
        await endInterview(session.sessionId);
      }
    } catch (err) {
      setError('Failed to submit answer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async (sessionId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/voice-interview/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mockme_token')}`
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error('Failed to end interview');

      const result = await response.json();
      
      // Try to play farewell audio; fallback to browser TTS with the message
      const farewellUrl = result.farewellAudio ? `${backendUrl}${result.farewellAudio}` : '';
      let spoken = false;
      if (farewellUrl) {
        try {
          await playAudio(farewellUrl);
          spoken = true;
        } catch (audioError) {
          console.warn('Farewell audio failed, trying browser TTS:', audioError);
        }
      }
      if (!spoken && result?.message) {
        await speakWithBrowserTTS(result.message);
      }
      
      console.log('VoiceInterview: calling onComplete callback');
      onComplete();
    } catch (err) {
      setError('Failed to end interview');
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <audio ref={audioRef} style={{ display: 'none' }} />
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-6">
        <audio ref={audioRef} style={{ display: 'none' }} />
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Voice Interview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {currentQuestion && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-teal-400 font-semibold">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
            </span>
            {isPlayingAudio && (
              <span className="flex items-center text-sky-400">
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                Playing...
              </span>
            )}
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {currentQuestion.question}
            </h3>
          </div>
          
          <div className="flex justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={loading || isPlayingAudio}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-200"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200 animate-pulse"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording ({formatTime(recordingTime)})
              </button>
            )}
          </div>
          
          {isRecording && (
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm">Recording your answer...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-400">
            Progress: {currentQuestion.questionNumber} of {currentQuestion.totalQuestions} questions
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterview;