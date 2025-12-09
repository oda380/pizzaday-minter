import React, { createContext, useContext, useState } from 'react';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState(null);

  const success = (msg) => setFeedback({ type: 'success', message: msg });
  const error = (msg) => setFeedback({ type: 'error', message: msg });
  const info = (msg) => setFeedback({ type: 'info', message: msg });
  const clear = () => setFeedback(null);

  return (
    <FeedbackContext.Provider value={{ feedback, setFeedback, success, error, info, clear }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};
