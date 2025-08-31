"use client";
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export function N8nChatbotEmbed() {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://n8n.srv810771.hstgr.cloud/webhook-test/chatbot-3',
      theme: {
        brandColor: '#2563eb', // Bleu principal
        backgroundColor: '#ffffff', // Fond blanc
        textColor: '#2563eb', // Texte bleu
        userMessageBackground: '#2563eb', // Bulle utilisateur bleu
        userMessageText: '#fff', // Texte utilisateur blanc
        botMessageBackground: '#fff', // Bulle bot blanche
        botMessageText: '#2563eb', // Texte bot bleu
        buttonColor: '#2563eb', // Bouton bleu
        buttonTextColor: '#fff', // Texte bouton blanc
      },
      mode: 'window',
      showWelcomeScreen: false,
      defaultLanguage: 'fr',
      initialMessages: [
        "Je suis votre Assistant immobilier. Comment puis-je vous aider aujourd'hui ?"
      ],
      i18n: {
        fr: {
          title: 'Assistant Keyora',
          subtitle: "Démarrez une discussion. Je suis là pour vous aider 24h/24.",
          footer: '',
          getStarted: 'Nouvelle conversation',
          inputPlaceholder: 'Posez votre question...',
          closeButtonTooltip: 'Fermer le chat'
        }
      }
    });

    // Correction JS pour forcer la couleur de l'input
    const interval = setInterval(() => {
      const input = document.querySelector('.n8n-chat__input input');
      if (input) {
        input.style.color = '#111';
        input.style.background = '#fff';
        input.style.caretColor = '#2563eb';
      }
      const textarea = document.querySelector('.n8n-chat__input textarea');
      if (textarea) {
        textarea.style.color = '#111';
        textarea.style.background = '#fff';
        textarea.style.caretColor = '#2563eb';
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);
  return null;
} 
