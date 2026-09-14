'use client';

import React from 'react';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotPanel } from './ChatbotPanel';

export const ChatbotWidget: React.FC = () => {
  return (
    <>
      <ChatbotButton />
      <ChatbotPanel />
    </>
  );
};
