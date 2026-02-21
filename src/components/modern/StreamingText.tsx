import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { styled, keyframes } from '@mui/material/styles';

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  showCursor?: boolean;
  cursorChar?: string;
  className?: string;
  component?: React.ElementType;
}

const blink = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
`;

const Cursor = styled('span')({
  animation: `${blink} 1s infinite`,
  marginLeft: '2px',
  fontWeight: 'normal',
});

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 20,
  onComplete,
  showCursor = true,
  cursorChar = '▋',
  className,
  component: Component = 'span',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    const streamText = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(streamText, speed);
      } else {
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    timeoutRef.current = setTimeout(streamText, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <Component className={className}>
      {displayedText}
      {showCursor && !isComplete && <Cursor>{cursorChar}</Cursor>}
    </Component>
  );
};

// Hook for streaming text from async source
export const useStreamingText = (
  streamGenerator: AsyncGenerator<string, void, unknown> | null,
  onComplete?: () => void
) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!streamGenerator) return;

    let cancelled = false;
    setIsStreaming(true);
    setError(null);
    setText('');

    const consumeStream = async () => {
      try {
        for await (const chunk of streamGenerator) {
          if (cancelled) break;
          setText((prev) => prev + chunk);
        }
        if (!cancelled) {
          setIsStreaming(false);
          if (onComplete) onComplete();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setIsStreaming(false);
        }
      }
    };

    consumeStream();

    return () => {
      cancelled = true;
    };
  }, [streamGenerator, onComplete]);

  return { text, isStreaming, error };
};

export default StreamingText;
