"use client";
import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export function N8nChatbotEmbed() {
  const chatInitialized = useRef(false);

  useEffect(() => {
    if (chatInitialized.current) return;
    
    const existingChats = document.querySelectorAll('.n8n-chat');
    existingChats.forEach(chat => chat.remove());

    try {
      createChat({
        webhookUrl: 'https://n8n.srv810771.hstgr.cloud/webhook/chatbot-3',
        theme: {
          brandColor: '#667eea',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          textColor: '#1f2937',
          userMessageBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          userMessageText: '#ffffff',
          botMessageBackground: 'rgba(255, 255, 255, 0.9)',
          botMessageText: '#1f2937',
          buttonColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          buttonTextColor: '#ffffff',
          borderRadius: '18px',
          shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        mode: 'window',
        showWelcomeScreen: true,
        defaultLanguage: 'en',
        initialMessages: [
          "🤖 Bonjour ! Je suis votre Assistant immobilier Keyora. Comment puis-je vous aider aujourd'hui ?"
        ],
        i18n: {
          fr: {
            title: '🤖 Assistant Keyora',
            subtitle: "Démarrez une discussion. Je suis là pour vous aider 24h/24 avec vos questions immobilières.",
            footer: 'Powered by Keyora AI',
            getStarted: 'Commencer la conversation',
            inputPlaceholder: 'Posez votre question...',
            closeButtonTooltip: 'Fermer le chat'
          }
        }
      });
      
      chatInitialized.current = true;
    } catch (error) {
      console.error('Erreur lors de la création du chat:', error);
    }

    return () => {
      const chats = document.querySelectorAll('.n8n-chat');
      chats.forEach(chat => chat.remove());
      chatInitialized.current = false;
    };
  }, []);

  return null;
}