"use client";
import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export function N8nChatbotEmbed() {
  const chatInitialized = useRef(false);

  useEffect(() => {
    // Éviter la double initialisation
    if (chatInitialized.current) return;
    
    // Nettoyer les instances précédentes
    const existingChats = document.querySelectorAll('.n8n-chat');
    existingChats.forEach(chat => chat.remove());

    try {
      createChat({
        webhookUrl: 'https://n8n.srv810771.hstgr.cloud/webhook/chatbot-3',
        theme: {
          brandColor: '#2563eb',
          backgroundColor: '#ffffff',
        },
        mode: 'window',
        showWelcomeScreen: true, // Changé en true
        defaultLanguage: 'fr',
        // Retirez initialMessages pour le moment
        i18n: {
          fr: {
            title: 'Assistant Keyora',
            subtitle: "Posez votre question...",
            inputPlaceholder: 'Tapez votre message...',
          }
        }
      });
      
      chatInitialized.current = true;
    } catch (error) {
      console.error('Erreur lors de la création du chat:', error);
    }

    // Cleanup
    return () => {
      const chats = document.querySelectorAll('.n8n-chat');
      chats.forEach(chat => chat.remove());
      chatInitialized.current = false;
    };
  }, []);

  return null;
}
