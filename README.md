# ERP Immobilier

Un système de gestion complet pour les agents immobiliers permettant de gérer les propriétés, les clients, les prospects, les visites, les documents et l'analytique.

## Technologies utilisées

- [Next.js](https://nextjs.org/) - Framework React
- [Clerk](https://clerk.dev/) - Authentification
- [Supabase](https://supabase.io/) - Base de données
- [Resend](https://resend.com/) - Service d'emails
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Configuration requise

1. Node.js 18.x ou supérieur
2. Un compte Clerk
3. Un compte Supabase
4. Un compte Resend

## Installation

1. Clonez le repository :
```bash
git clone [url-du-repo]
cd erp-immobilier
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=votre_clerk_publishable_key
CLERK_SECRET_KEY=votre_clerk_secret_key
CLERK_WEBHOOK_SECRET=votre_clerk_webhook_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_supabase_service_role_key

# Resend
RESEND_API_KEY=votre_resend_api_key
```

4. Configurez la base de données Supabase :
- Créez un nouveau projet dans Supabase
- Exécutez le script SQL du fichier `supabase/schema.sql` dans l'éditeur SQL de Supabase

## Fonctionnalités

- **Authentification**
  - Inscription/Connexion des agents
  - Gestion des profils

- **Gestion des propriétés**
  - Ajout/Modification/Suppression de propriétés
  - Upload de photos
  - Statut des propriétés (disponible, en attente, vendu)

- **Gestion des clients et prospects**
  - Base de données clients
  - Suivi des prospects
  - Matching automatique propriétés/prospects

- **Gestion des visites**
  - Planification des visites
  - Suivi des visites
  - Notifications automatiques

- **Gestion documentaire**
  - Upload et stockage de documents
  - Organisation par propriété/client
  - Gestion des versions

- **Analytique**
  - Tableau de bord
  - Statistiques de performance
  - Rapports personnalisés

## Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Déploiement

L'application peut être déployée sur Vercel :

1. Créez un compte sur [Vercel](https://vercel.com)
2. Connectez votre repository
3. Configurez les variables d'environnement
4. Déployez !

## Support

Pour toute question ou problème, veuillez ouvrir une issue dans le repository.

## Licence

MIT
"# keyora-demo" 
