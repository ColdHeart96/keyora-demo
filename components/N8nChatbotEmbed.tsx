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
          brandColor: '#2563eb',
          backgroundColor: '#ffffff',
          textColor: '#2563eb',
          userMessageBackground: '#2563eb',
          userMessageText: '#fff',
          botMessageBackground: '#fff',
          botMessageText: '#2563eb',
          buttonColor: '#2563eb',
          buttonTextColor: '#fff',
        },
        mode: 'window',
        showWelcomeScreen: true,
        defaultLanguage: 'fr',
        initialMessages: [
          "Je suis votre Assistant immobilier. Comment puis-je vous aider aujourd'hui ?"
        ],
        i18n: {
          fr: {
            title: 'Assistant Keyora',
            subtitle: "Démarrez une discussion. Je suis là pour vous aider 24h/24.",
            footer: '',
            getStarted: 'Commencer',
            inputPlaceholder: 'Posez votre question...',
            closeButtonTooltip: 'Fermer le chat'
          }
        },
        // Ajouter un transformateur de réponse personnalisé
        transformResponse: (response) => {
          try {
            // Si la réponse est un tableau JSON avec des objets output
            if (Array.isArray(response) && response.length > 0 && response[0].output) {
              return response[0].output;
            }
            // Si c'est déjà une chaîne de caractères
            if (typeof response === 'string') {
              return response;
            }
            // Si c'est un objet avec une propriété output
            if (response && typeof response === 'object' && response.output) {
              return response.output;
            }
            // Sinon, convertir en string
            return JSON.stringify(response);
          } catch (error) {
            console.error('Erreur lors du traitement de la réponse:', error);
            return typeof response === 'string' ? response : JSON.stringify(response);
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
