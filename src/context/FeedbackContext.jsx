import React, { createContext, useContext, useState } from 'react';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState("");

  const success = (msg) => setFeedback(`✅ ${msg}`);
  const error = (msg) => setFeedback(`❗️ ${msg}`);
  const info = (msg) => setFeedback(`🔔 ${msg}`);
  const clear = () => setFeedback("");

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
