/**
 * Curated challenges. Flags are demo flags, not secrets protecting real systems.
 * For a public deployment, move answer checking to a separate module and
 * avoid exposing flags in client-side code or public repositories.
 */
const challenges = [
  {
    id: 'py-001',
    title: 'Broken Parser',
    category: 'code',
    difficulty: 'Facile',
    points: 100,
    description: 'Une boucle Python parcourt range(len(numbers) - 1). Quel bug classique peut-elle provoquer ?',
    hint: 'Regarde la borne de fin de range : elle est exclue.',
    acceptedAnswers: ['off by one', 'off-by-one', 'dernier element', 'dernier élément', 'borne exclusive'],
    flag: 'GLITCH{off_by_one}'
  },
  {
    id: 'py-002',
    title: 'Unique Values',
    category: 'code',
    difficulty: 'Facile',
    points: 150,
    description: 'En Python, quelle structure native est adaptée pour conserver uniquement les valeurs uniques d’une collection ? Réponds avec son nom.',
    hint: 'Cette structure ne conserve pas les doublons.',
    acceptedAnswers: ['set'],
    flag: 'GLITCH{set}'
  },
  {
    id: 'crypto-001',
    title: 'César +3',
    category: 'cyber',
    difficulty: 'Facile',
    points: 100,
    description: 'Décode le texte chiffré avec un chiffre de César de +3 : FUBSWR. Le texte d’origine est en anglais.',
    hint: 'Décale chaque lettre de trois positions vers l’arrière.',
    acceptedAnswers: ['crypto'],
    flag: 'GLITCH{crypto}'
  },
  {
    id: 'logs-001',
    title: 'Connexion suspecte',
    category: 'forensics',
    difficulty: 'Facile',
    points: 200,
    description: 'Logs fictifs : 09:01 login success user=alice ; 09:04 login failed user=admin ; 09:05 login failed user=admin ; 09:06 login failed user=admin. Quel compte subit les échecs répétés ?',
    hint: 'Repère le nom répété sur les trois échecs.',
    acceptedAnswers: ['admin'],
    flag: 'GLITCH{admin}'
  },
  {
    id: 'web-001',
    title: 'Validation côté serveur',
    category: 'cyber',
    difficulty: 'Moyen',
    points: 250,
    description: 'Dans une application fictive, pourquoi une validation uniquement en JavaScript côté navigateur ne suffit-elle pas ? Réponds en quelques mots.',
    hint: 'Un utilisateur peut contourner ou modifier le code côté client.',
    acceptedAnswers: ['validation serveur', 'cote serveur', 'côté serveur', 'server side', 'serveur'],
    flag: 'GLITCH{server_side_validation}'
  },
  {
    id: 'algo-001',
    title: 'Complexité',
    category: 'code',
    difficulty: 'Moyen',
    points: 250,
    description: 'Un algorithme parcourt une liste de n éléments une seule fois avec un nombre constant d’opérations par élément. Quelle est sa complexité temporelle ?',
    hint: 'Le temps augmente proportionnellement à la taille de la liste.',
    acceptedAnswers: ['o(n)', 'on', 'linéaire', 'lineaire', 'linear'],
    flag: 'GLITCH{linear_time}'
  },
  {
    id: 'forensics-001',
    title: 'Empreinte',
    category: 'forensics',
    difficulty: 'Moyen',
    points: 200,
    description: 'Quel outil cryptographique est couramment utilisé pour produire une empreinte SHA-256 d’un fichier ? Réponds « sha256sum » ou « shasum -a 256 ».',
    hint: 'Sous Linux, cherche une commande dont le nom contient sha256.',
    acceptedAnswers: ['sha256sum', 'shasum -a 256'],
    flag: 'GLITCH{sha256sum}'
  },
  {
    id: 'crypto-002',
    title: 'Hexa',
    category: 'cyber',
    difficulty: 'Facile',
    points: 150,
    description: 'Décode la chaîne hexadécimale UTF-8 suivante : 474c49544348. Réponds avec le mot obtenu.',
    hint: 'Chaque paire de chiffres hexadécimaux représente un octet.',
    acceptedAnswers: ['glitch'],
    flag: 'GLITCH{hex_to_text}'
  },
  {
    id: 'sql-001',
    title: 'Injection logique',
    category: 'cyber',
    difficulty: 'Moyen',
    points: 300,
    description: 'Quel type de faille survient quand un input utilisateur est concaténé dans une requête SQL sans validation ? Réponds en français ou en anglais.',
    hint: 'Le mot clé est souvent “injection”.',
    acceptedAnswers: ['sql injection', 'injection sql'],
    flag: 'GLITCH{sql_injection}'
  },
  {
    id: 'sec-001',
    title: 'Principe de moindre privilège',
    category: 'cyber',
    difficulty: 'Moyen',
    points: 275,
    description: 'Quel principe dit qu’un compte ne doit avoir que les droits strictement nécessaires à son rôle ?',
    hint: 'Le terme contient “minimum” et “privileges”.',
    acceptedAnswers: ['principe du moindre privilege', 'moindre privilege', 'least privilege', 'least privilege principle'],
    flag: 'GLITCH{least_privilege}'
  },
  {
    id: 'net-001',
    title: 'Port HTTP',
    category: 'cyber',
    difficulty: 'Facile',
    points: 120,
    description: 'Quel port TCP est couramment utilisé pour le trafic HTTP non chiffré ?',
    hint: 'Le port est le 80.',
    acceptedAnswers: ['80'],
    flag: 'GLITCH{port_80}'
  },
  {
    id: 'forensics-002',
    title: 'Trace de connexion',
    category: 'forensics',
    difficulty: 'Moyen',
    points: 220,
    description: 'Un journal montre une entrée avec le mot “denied”. Que signifie cette information au sens de sécurité ?',
    hint: 'La tentative a été refusée.',
    acceptedAnswers: ['access denied', 'accès refusé', 'refusé', 'denied'],
    flag: 'GLITCH{access_denied}'
  },
  {
    id: 'server-001',
    title: 'Rôle fantôme',
    category: 'cyber',
    difficulty: 'Moyen',
    points: 260,
    description: 'Un rôle de serveur a été créé soudainement avec un nom suspect. Quel bon réflexe de sécurité est le plus important avant de le supprimer ?',
    hint: 'Vérifie les permissions et les éventuels abus de privilèges.',
    acceptedAnswers: ['vérifier les permissions', 'verifier les permissions', 'contrôler les permissions', 'controler les permissions', 'analyser les permissions'],
    flag: 'GLITCH{check_permissions}'
  },
  {
    id: 'server-002',
    title: 'Canal verrouillé',
    category: 'cyber',
    difficulty: 'Difficile',
    points: 350,
    description: 'Un canal de discussion a été renommé et ses permissions ont changé. Quel type d’attaque ou d’anomalie cela évoque-t-il ?',
    hint: 'C’est un comportement typique d’une manipulation malveillante ou d’un faux incident de sécurité.',
    acceptedAnswers: ['lockdown', 'lock down', 'saturation', 'anomalie de permissions', 'modification de permissions'],
    flag: 'GLITCH{lockdown_simulation}'
  },
  {
    id: 'server-003',
    title: 'Le bon réflexe',
    category: 'cyber',
    difficulty: 'Facile',
    points: 180,
    description: 'Lors d’un incident de sécurité sur un serveur, quelle action est la plus adaptée en premier ? Réponds avec un mot ou une courte phrase.',
    hint: 'Il faut arrêter l’incident avant d’examiner les dégâts.',
    acceptedAnswers: ['neutraliser', 'neutraliser lincident', 'isoler', 'stop', 'arrêter lincident'],
    flag: 'GLITCH{contain_incident}'
  },
  {
    id: 'server-004',
    title: 'Rôle privilege abusif',
    category: 'cyber',
    difficulty: 'Difficile',
    points: 420,
    description: 'Un rôle a été ajouté au serveur avec un nom étrange et il peut gérer les rôles. Quelle mauvaise pratique a été commise ? Réponds avec une courte phrase.',
    hint: 'Il y a trop de droits accordés à un seul rôle.',
    acceptedAnswers: ['droit excessif', 'privileges excessifs', 'surprivilege', 'permissions excessives', 'abuse de privilege'],
    flag: 'GLITCH{excessive_permissions}'
  },
  {
    id: 'server-005',
    title: 'Audit de permissions',
    category: 'forensics',
    difficulty: 'Difficile',
    points: 440,
    description: 'Dans un contexte de sécurité serveur, pourquoi est-il utile de garder un historique des changements de permissions ?',
    hint: 'Ça aide à retrouver l’origine d’un incident et à prouver ce qui a changé.',
    acceptedAnswers: ['tracer la cause', 'tracer lorigine', 'audit', 'détecter la cause', 'reconstituer lincident'],
    flag: 'GLITCH{track_permission_changes}'
  },
  {
    id: 'cyber-003',
    title: 'Auth bypass',
    category: 'cyber',
    difficulty: 'Difficile',
    points: 500,
    description: 'Quel type de vulnérabilité apparaît quand une application autorise l’accès sans vérifier correctement les droits d’un compte ? Réponds en anglais ou français.',
    hint: 'Le mot clé est souvent “bypass” et concerne l’authentification.',
    acceptedAnswers: ['authentication bypass', 'auth bypass', 'bypass authentification', 'contournement d authentification', 'contournement dauthentification'],
    flag: 'GLITCH{auth_bypass}'
  },
  {
    id: 'cyber-004',
    title: 'Mauvaise isolation',
    category: 'cyber',
    difficulty: 'Difficile',
    points: 470,
    description: 'Quel principe de sécurité est violé quand plusieurs environnements partagent des ressources sans isolation adéquate ?',
    hint: 'On parle souvent de “segregation” ou de séparation des environnements.',
    acceptedAnswers: ['segregation', 'séparation', 'isolation insuffisante', 'isolation', 'separation'],
    flag: 'GLITCH{poor_isolation}'
  },
  {
    id: 'server-006',
    title: 'Permission fatale',
    category: 'server',
    difficulty: 'Très difficile',
    points: 550,
    description: 'Quel type de permission est considéré comme critique si un rôle peut créer, supprimer et modifier des salons ou des rôles pour n’importe quel membre ?',
    hint: 'Cela donne un pouvoir de gestion globale du serveur.',
    acceptedAnswers: ['gestion serveur', 'server management', 'admin permissions', 'permissions administratives', 'droits admins'],
    flag: 'GLITCH{server_admin_risk}'
  },
  {
    id: 'cyber-005',
    title: 'Pire cas : bruteforce',
    category: 'cyber',
    difficulty: 'Très difficile',
    points: 620,
    description: 'Quel mot décrit l’attaque qui tente de deviner un mot de passe en testant de nombreuses combinaisons automatiquement ?',
    hint: 'C’est une méthode de force exhaustive.',
    acceptedAnswers: ['bruteforce', 'brute force', 'force brute', 'attaque par brute force'],
    flag: 'GLITCH{bruteforce}'
  },
  {
    id: 'soc-001',
    title: 'Phishing de confiance',
    category: 'cyber',
    difficulty: 'Très difficile',
    points: 680,
    description: 'Quel type d’attaque exploite la confiance d’un utilisateur pour lui faire cliquer sur un faux lien ou une fausse demande de sécurité ?',
    hint: 'Le mot clé commence par “phish”.',
    acceptedAnswers: ['phishing', 'hameçonnage', 'watering hole'],
    flag: 'GLITCH{phishing}'
  }
];

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function getChallenge(id) {
  return challenges.find(c => c.id === id);
}

function checkAnswer(challenge, answer) {
  const candidate = normalize(answer);
  return challenge.acceptedAnswers.some(a => normalize(a) === candidate) ||
    normalize(answer) === normalize(challenge.flag);
}

module.exports = { challenges, getChallenge, checkAnswer };
