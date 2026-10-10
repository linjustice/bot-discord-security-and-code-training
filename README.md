# GLITCH — Discord Challenge Bot

Bot Discord en français pour des challenges de programmation, de cybersécurité éthique et de forensics, avec XP, profils, classement et duels.

## Prérequis
- Node.js 20 ou supérieur
- Un compte Discord et une application créée sur le Discord Developer Portal

## Installation
1. Installe Node.js : https://nodejs.org/
2. Crée une application : https://discord.com/developers/applications
3. Dans l'application, ouvre **Bot** et crée/récupère le token.
4. Dans **OAuth2 > General**, copie l'Application ID.
5. Dans **OAuth2 > URL Generator**, coche `bot` et `applications.commands`, puis invite le bot sur ton serveur. Il n'a pas besoin d'administrateur.
6. Copie `.env.example` vers `.env` et remplis les variables.
7. Dans le terminal, à la racine du projet :

```bash
npm install
npm run register
npm start
```

Alternative rapide depuis le terminal :

```bash
node src/index.js --token "TON_TOKEN" --client-id "TON_CLIENT_ID" --guild-id "TON_GUILD_ID"
```

Pour un serveur de test, renseigne `GUILD_ID` dans `.env`. Les commandes de serveur se mettent à jour plus vite. Sans `GUILD_ID`, les commandes sont enregistrées globalement et peuvent prendre du temps à apparaître.

## Commandes
- `/glitch-start`
- `/missions [categorie]`
- `/challenge id:py-001`
- `/submit id:py-001 reponse:...`
- `/hint id:py-001`
- `/profile [membre]`
- `/leaderboard`
- `/duels`
- `/duel membre:@joueur id:py-001`
- `/duel-answer id:1 reponse:...`
- `/raid-sim [niveau]`
- `/raid-help`
- `/raid-status`
- `/raid-stop`

## Dashboard de faux raid
Le bot dispose d’un mode de démonstration de sécurité avec un panneau interactif en style dashboard :
- sélection de niveau (léger, moyen, urgent)
- phases : Recon / Payload / Escalade / Lockdown / Panic
- boutons de contrôle, logs et neutralisation
- faux changements visibles sur le serveur (rôle, salon, permissions)

Le but est de repérer l’anomalie en observant les logs et les changements temporaires, puis de neutraliser la simulation avant la fin du timer.

## Ajouter une mission
Ajoute un objet dans `src/challenges.js` avec :
- `id` unique
- `title`, `category`, `difficulty`, `points`
- `description`, `hint`
- `acceptedAnswers` (réponses acceptées)
- `flag`

Redémarre le bot après modification.

## Ajouter une mission
Ajoute un objet dans `src/challenges.js` avec :
- `id` unique
- `title`, `category`, `difficulty`, `points`
- `description`, `hint`
- `acceptedAnswers` (réponses acceptées)
- `flag`

Redémarre le bot après modification.

## Sécurité et limites
- Ce MVP ne lance aucun code soumis par les utilisateurs.
- Les missions de cyber sont des exercices fictifs et sans cible externe.
- Ne mets jamais ton token Discord dans le code ou dans un dépôt public.
- Pour un véritable évaluateur de code, utilise un conteneur isolé avec limites CPU/mémoire/temps, système de fichiers temporaire, réseau désactivé et utilisateur non privilégié.
- Les réponses acceptées sont stockées dans le code du bot : cette version est destinée à un MVP privé. Pour un service public compétitif, déplace la validation dans un backend séparé.
