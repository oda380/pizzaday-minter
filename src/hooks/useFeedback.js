import { useState } from 'react';

export function useFeedback() {
  const [feedback, setFeedback] = useState("");

  const success = (msg) => setFeedback(`✅ ${msg}`);
  const error = (msg) => setFeedback(`❗️ ${msg}`);
  const info = (msg) => setFeedback(`ℹ️ ${msg}`);
  const clear = () => setFeedback("");

  return {
    feedback,
    setFeedback,
    success,
    error,
    info,
    clear,
  };
}
