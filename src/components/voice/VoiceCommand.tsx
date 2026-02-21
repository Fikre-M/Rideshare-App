/**
 * Voice Command Component
 * Uses Web Speech API for voice input and synthesis
 * Includes visual waveform animation using Canvas API
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Fade,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

interface VoiceCommandProps {
  onCommand: (command: string) => Promise<string>;
  onError?: (error: string) => void;
}

const VoiceCommand: React.FC<VoiceCommandProps> = ({ onCommand, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      onError?.('Voice commands are not supported in this browser');
    }
  }, [onError]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      startWaveformAnimation();
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        handleCommand(transcriptText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      stopWaveformAnimation();
      onError?.(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      stopWaveformAnimation();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopWaveformAnimation();
    };
  }, [isSupported]);

  // Waveform animation
  const startWaveformAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw multiple sine waves
      const waves = 3;
      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(25, 118, 210, ${0.3 + i * 0.2})`;
        ctx.lineWidth = 2;

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin((x * 0.02 + phase + i * 0.5) * (i + 1)) * (20 + i * 10);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      phase += 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const stopWaveformAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Handle voice command
  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    setTranscript(command);

    try {
      const result = await onCommand(command);
      setResponse(result);
      speak(result);
    } catch (error) {
      console.error('Error processing command:', error);
      const errorMsg = 'Sorry, I encountered an error processing your command.';
      setResponse(errorMsg);
      speak(errorMsg);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">
          Voice commands are not supported in this browser.
          Please use Chrome, Edge, or Safari.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Voice Control Button */}
      <m.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          onClick={toggleListening}
          disabled={isProcessing}
          sx={{
            width: 64,
            height: 64,
            background: isListening
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: isListening
                ? 'linear-gradient(135deg, #e082ea 0%, #e4465b 100%)'
                : 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
            },
            boxShadow: isListening
              ? '0 0 20px rgba(245, 87, 108, 0.5)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
          }}
        >
          {isProcessing ? (
            <CircularProgress size={32} sx={{ color: 'white' }} />
          ) : isListening ? (
            <Mic size={32} />
          ) : (
            <MicOff size={32} />
          )}
        </IconButton>
      </m.div>

      {/* Status Chips */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {isListening && (
          <Chip
            label="Listening..."
            color="error"
            size="small"
            icon={<Mic size={16} />}
          />
        )}
        {isSpeaking && (
          <Chip
            label="Speaking"
            color="primary"
            size="small"
            icon={<Volume2 size={16} />}
            onDelete={stopSpeaking}
            deleteIcon={<VolumeX size={16} />}
          />
        )}
        {isProcessing && (
          <Chip
            label="Processing..."
            color="warning"
            size="small"
          />
        )}
      </Box>

      {/* Waveform Canvas */}
      <AnimatePresence>
        {isListening && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 100 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={100}
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                }}
              />
            </Box>
          </m.div>
        )}
      </AnimatePresence>

      {/* Transcript Display */}
      <Fade in={!!transcript}>
        <Paper
          sx={{
            mt: 2,
            p: 2,
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            You said:
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {transcript || 'Waiting for input...'}
          </Typography>
        </Paper>
      </Fade>

      {/* Response Display */}
      <Fade in={!!response}>
        <Paper
          sx={{
            mt: 2,
            p: 2,
            background: 'linear-gradient(135deg, #10b98115 0%, #05966915 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            AI Response:
          </Typography>
          <Typography variant="body1">
            {response}
          </Typography>
        </Paper>
      </Fade>

      {/* Example Commands */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Try saying:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {[
            'Find me a driver to downtown',
            'What\'s the surge price right now?',
            'Show me my recent trips',
            'Book an SUV for tomorrow morning',
          ].map((example) => (
            <Chip
              key={example}
              label={example}
              size="small"
              variant="outlined"
              onClick={() => handleCommand(example)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VoiceCommand;
