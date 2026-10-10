require('dotenv').config();
const {
  Client, GatewayIntentBits, EmbedBuilder, Events, MessageFlags
} = require('discord.js');
const { db, ensureProfile } = require('./db');
const { challenges, getChallenge, checkAnswer } = require('./challenges');
const { applyCliOverrides, registerCommands } = require('./deploy-commands');
const {
  applyRaidEffects,
  buildRaidDashboard,
  buildRaidPanel,
  getActiveRaidSession,
  getRaidLogSummary,
  getRaidStatusText,
  rollbackRaidEffects,
  setSessionPhase,
  startRaidSession,
  stopRaidSession,
  normalizeLevel
} = require('./raid');

applyCliOverrides();

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN manquant. Passe --token ou renseigne .env.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const ephemeral = MessageFlags.Ephemeral;

function embed(title, description, color = 0x8B7CFF) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color)
    .setFooter({ text: 'GLITCH • Learn. Solve. Repeat.' })
    .setTimestamp();
}
function categoryName(category) {
  return ({ code: 'Code Lab', cyber: 'Cyber Lab', forensics: 'Digital Forensics' })[category] || category;
}
function challengeText(c) {
  return `**${c.title}** — ${c.difficulty} • ${c.points} XP\n` +
    `ID : \`${c.id}\`\nCatégorie : **${categoryName(c.category)}**\n\n${c.description}\n\n` +
    `Soumets ta réponse avec \`/submit id:${c.id} reponse:...\``;
}
function isSolved(userId, challengeId) {
  return Boolean(db.prepare('SELECT 1 FROM solves WHERE user_id=? AND challenge_id=?').get(userId, challengeId));
}

client.once(Events.ClientReady, readyClient => {
  console.log(`GLITCH connecté en tant que ${readyClient.user.tag}`);
  readyClient.user.setActivity('les challenges • /missions');
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'raid_level_select') {
    const selectedLevel = normalizeLevel(interaction.values[0]);
    const session = getActiveRaidSession(interaction.user.id);
    const panel = buildRaidPanel(selectedLevel);

    await interaction.update({
      content: session ? getRaidStatusText(session) : `Niveau sélectionné : **${selectedLevel}**. Démarre la simulation avec le bouton ci-dessous.`,
      embeds: [buildRaidDashboard(session, selectedLevel)],
      components: panel,
      ephemeral: true
    });
    return;
  }

  if (interaction.isButton()) {
    const userId = interaction.user.id;

    if (interaction.customId.startsWith('phase_')) {
      const session = getActiveRaidSession(userId);
      if (!session) {
        await interaction.update({
          content: 'Aucune simulation active pour ce membre.',
          components: buildRaidPanel('medium', null),
          ephemeral: true
        });
        return;
      }

      const phaseName = interaction.customId.replace('phase_', '');
      setSessionPhase(session, phaseName);
      await interaction.update({
        content: `🧭 Phase forcée : **${phaseName.toUpperCase()}**\n${getRaidStatusText(session)}`,
        embeds: [buildRaidDashboard(session)],
        components: buildRaidPanel(session.level, session),
        ephemeral: true
      });
      return;
    }

    if (interaction.customId === 'raid_start') {
      const selectedLevel = normalizeLevel(interaction.message.content?.match(/Niveau sélectionné : \*\*(.+?)\*\*/)?.[1] || 'medium');
      const effectState = await applyRaidEffects(interaction.guild, selectedLevel).catch(() => null);
      const session = startRaidSession({
        userId,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        level: selectedLevel,
        effectState
      });

      const payload = {
        content: `🚨 Simulation démarrée. ${getRaidStatusText(session)}\n🔎 Observe les rôles, permissions et salons pour repérer l’anomalie.`,
        embeds: [buildRaidDashboard(session)],
        components: buildRaidPanel(session.level, session),
        ephemeral: true
      };
      await interaction.update(payload);
      console.log(`[RAID-SIM] ${userId} : simulation ${session.level} démarrée`);
      return;
    }

    if (interaction.customId === 'raid_stop') {
      const session = getActiveRaidSession(userId);
      const stopped = stopRaidSession(userId);
      if (session && interaction.guild) {
        await rollbackRaidEffects(interaction.guild, session.effectState).catch(() => {});
      }
      await interaction.update({
        content: stopped ? '🛡️ Simulation neutralisée. Les changements de rôle / salon / permissions ont été restaurés.' : 'Aucune simulation active à neutraliser.',
        components: buildRaidPanel('medium'),
        ephemeral: true
      });
      return;
    }

    if (interaction.customId === 'raid_logs') {
      const summary = getRaidLogSummary(userId) || 'Aucune simulation active pour ce membre.';
      await interaction.update({
        content: `📜 **Journal de simulation**\n${summary}`,
        embeds: [buildRaidDashboard(getActiveRaidSession(userId))],
        components: buildRaidPanel('medium', getActiveRaidSession(userId)),
        ephemeral: true
      });
      return;
    }

    if (interaction.customId === 'raid_help') {
      await interaction.update({
        content: [
          '**Aide — simulation de sécurité**',
          '1. Choisis le niveau, puis démarre.',
          '2. Observe les phases, les logs et les changements temporaires.',
          '3. Utilise **Stop / neutraliser** pour restaurer l’état du serveur.',
          '⚠️ Démonstration contrôlée uniquement.'
        ].join('\n'),
        embeds: [buildRaidDashboard(getActiveRaidSession(userId))],
        components: buildRaidPanel('medium', getActiveRaidSession(userId)),
        ephemeral: true
      });
      return;
    }
  }

  if (!interaction.isChatInputCommand()) return;
  const userId = interaction.user.id;
  try {
    switch (interaction.commandName) {
      case 'glitch-start': {
        await interaction.reply({
          embeds: [embed('Bienvenue dans GLITCH', [
            'Un laboratoire de challenges de programmation et de cybersécurité éthique.',
            '',
            '`/missions` — liste des défis',
            '`/challenge id:py-001` — affiche une mission',
            '`/submit id:py-001 reponse:...` — soumet une réponse',
            '`/hint id:py-001` — demande un indice',
            '`/profile` — consulte ta progression',
            '`/leaderboard` — classement global',
            '`/duel membre:@joueur id:py-001` — lance un duel',
            '',
            'Tous les scénarios sont fictifs. Utilise les techniques de sécurité uniquement dans des environnements autorisés.'
          ].join('\n'))],
          flags: ephemeral
        });
        break;
      }
      case 'missions': {
        const category = interaction.options.getString('categorie') || 'all';
        const list = challenges.filter(c => category === 'all' || c.category === category);
        await interaction.reply({
          embeds: [embed('Missions disponibles', list.map(c =>
            `**${c.title}** • \`${c.id}\` • ${c.difficulty} • ${c.points} XP`
          ).join('\n') || 'Aucune mission dans cette catégorie.')],
          flags: ephemeral
        });
        break;
      }
      case 'challenge': {
        const id = interaction.options.getString('id');
        const c = getChallenge(id);
        if (!c) return interaction.reply({ content: 'Mission inconnue. Utilise `/missions`.', flags: ephemeral });
        await interaction.reply({ embeds: [embed(`Mission • ${c.id}`, challengeText(c))], flags: ephemeral });
        break;
      }
      case 'submit': {
        const id = interaction.options.getString('id');
        const answer = interaction.options.getString('reponse');
        const c = getChallenge(id);
        if (!c) return interaction.reply({ content: 'Mission inconnue. Utilise `/missions`.', flags: ephemeral });
        ensureProfile(userId);
        if (isSolved(userId, id)) {
          return interaction.reply({ content: 'Tu as déjà validé cette mission. Bien joué !', flags: ephemeral });
        }
        if (!checkAnswer(c, answer)) {
          return interaction.reply({
            embeds: [embed('Réponse incorrecte', 'Pas encore. Relis l’énoncé ou utilise `/hint id:' + id + '`.', 0xE09A55)],
            flags: ephemeral
          });
        }
        const tx = db.transaction(() => {
          const result = db.prepare('INSERT OR IGNORE INTO solves (user_id, challenge_id) VALUES (?, ?)').run(userId, id);
          if (result.changes) {
            db.prepare('UPDATE profiles SET xp=xp+?, solved_count=solved_count+1 WHERE user_id=?').run(c.points, userId);
          }
          return result.changes;
        });
        const inserted = tx();
        if (!inserted) return interaction.reply({ content: 'Mission déjà validée.', flags: ephemeral });
        await interaction.reply({
          embeds: [embed('Challenge validé !', `Tu as gagné **${c.points} XP**.\nMission : **${c.title}**\nContinue avec \`/missions\`.`, 0x43B581)]
        });
        break;
      }
      case 'hint': {
        const c = getChallenge(interaction.options.getString('id'));
        if (!c) return interaction.reply({ content: 'Mission inconnue.', flags: ephemeral });
        await interaction.reply({ embeds: [embed(`Indice • ${c.title}`, c.hint)], flags: ephemeral });
        break;
      }
      case 'profile': {
        const target = interaction.options.getUser('membre') || interaction.user;
        const p = ensureProfile(target.id);
        const rank = db.prepare('SELECT COUNT(*) + 1 AS rank FROM profiles WHERE xp > ?').get(p.xp).rank;
        await interaction.reply({
          embeds: [embed(`Profil de ${target.username}`,
            `**XP :** ${p.xp}\n**Missions validées :** ${p.solved_count}\n**Rang global :** #${rank}`)],
          flags: ephemeral
        });
        break;
      }
      case 'leaderboard': {
        const rows = db.prepare(`
          SELECT user_id, xp, solved_count FROM profiles
          ORDER BY xp DESC, solved_count DESC LIMIT 10
        `).all();
        const lines = await Promise.all(rows.map(async (r, i) => {
          const user = await client.users.fetch(r.user_id).catch(() => null);
          return `**${i + 1}.** ${user ? user.username : 'Utilisateur inconnu'} — ${r.xp} XP • ${r.solved_count} missions`;
        }));
        await interaction.reply({
          embeds: [embed('Classement GLITCH', lines.join('\n') || 'Aucun score pour le moment.')],
          flags: ephemeral
        });
        break;
      }
      case 'raid-help': {
        await interaction.reply({
          content: [
            '🧭 Help — raid simulé',
            '',
            'La simulation fait de vrais changements visibles dans le serveur pendant un temps limité :',
            '- création d’un rôle temporaire',
            '- renommage d’un salon principal',
            '- création d’un salon “incident” temporaire',
            '- modification des permissions de lecture / écriture',
            '',
            '🎯 Objectif : détecter les anomalies, lire les logs et neutraliser le faux incident avant la fin du timer.',
            '🛡️ Le bouton **Stop / neutraliser** remet le serveur dans son état d’origine.',
            '📜 La commande `/raid-status` permet de relire les logs du défi.'
          ].join('\n'),
          flags: ephemeral
        });
        break;
      }
      case 'raid-status': {
        const session = getActiveRaidSession(userId);
        const status = getRaidStatusText(session);
        await interaction.reply({
          content: `${status}\n\n${session ? getRaidLogSummary(userId) : 'Aucune simulation active.'}`,
          flags: ephemeral
        });
        break;
      }
      case 'raid-stop': {
        const session = getActiveRaidSession(userId);
        const stopped = stopRaidSession(userId);
        if (session && interaction.guild) {
          await rollbackRaidEffects(interaction.guild, session.effectState).catch(() => {});
        }
        await interaction.reply({
          content: stopped ? '🛡️ Simulation neutralisée. Les changements de rôle / salon / permissions ont été restaurés.' : 'Aucune simulation active pour ce membre.',
          flags: ephemeral
        });
        break;
      }
      case 'duels': {
        const rows = db.prepare(`
          SELECT id, challenger_id, opponent_id, challenge_id, status, winner_id, created_at
          FROM duels
          ORDER BY id DESC LIMIT 20
        `).all();

        if (!rows.length) {
          return interaction.reply({ content: 'Aucun duel enregistré pour le moment.', flags: ephemeral });
        }

        const lines = await Promise.all(rows.map(async row => {
          const challenger = await client.users.fetch(row.challenger_id).catch(() => null);
          const opponent = await client.users.fetch(row.opponent_id).catch(() => null);
          const winner = row.winner_id ? await client.users.fetch(row.winner_id).catch(() => null) : null;
          const challenge = getChallenge(row.challenge_id);
          const statusLabel = row.status === 'pending' ? '⏳ En cours' : row.status === 'completed' ? '✅ Terminé' : row.status;
          const winnerLabel = winner ? ` • gagnant: ${winner.username}` : '';
          return `**#${row.id}** • ${challenger ? challenger.username : 'Inconnu'} vs ${opponent ? opponent.username : 'Inconnu'} • ${challenge ? challenge.title : row.challenge_id} • ${statusLabel}${winnerLabel}`;
        }));

        await interaction.reply({
          embeds: [embed('Tous les duels GLITCH', lines.join('\n'))],
          flags: ephemeral
        });
        break;
      }
      case 'duel': {
        const opponent = interaction.options.getUser('membre');
        const id = interaction.options.getString('id');
        const c = getChallenge(id);
        if (!c) return interaction.reply({ content: 'Mission inconnue.', flags: ephemeral });
        if (opponent.bot || opponent.id === userId) {
          return interaction.reply({ content: 'Choisis un autre membre humain.', flags: ephemeral });
        }
        const result = db.prepare(
          'INSERT INTO duels (challenger_id, opponent_id, challenge_id) VALUES (?, ?, ?)'
        ).run(userId, opponent.id, id);
        await interaction.reply({
          content: `<@${opponent.id}> : <@${userId}> te défie ! Duel **#${result.lastInsertRowid}** sur **${c.title}**. Réponds avec \`/duel-answer id:${result.lastInsertRowid} reponse:...\``,
          allowedMentions: { users: [opponent.id, userId] }
        });
        break;
      }
      case 'raid-sim': {
        const level = interaction.options.getString('niveau') || 'medium';
        const panel = buildRaidPanel(level);

        await interaction.reply({
          content: '🧪 Démo de réponse à incident. Observe les indices puis neutralise la simulation avant la fin du chrono.',
          embeds: [buildRaidDashboard(null, level)],
          components: panel,
          flags: ephemeral
        });
        break;
      }
      case 'duel-answer': {
        const duelId = interaction.options.getInteger('id');
        const answer = interaction.options.getString('reponse');
        const duel = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
        if (!duel) return interaction.reply({ content: 'Duel introuvable.', flags: ephemeral });
        if (![duel.challenger_id, duel.opponent_id].includes(userId)) {
          return interaction.reply({ content: 'Tu ne participes pas à ce duel.', flags: ephemeral });
        }
        if (duel.status !== 'pending') {
          return interaction.reply({ content: 'Ce duel est déjà terminé.', flags: ephemeral });
        }
        const c = getChallenge(duel.challenge_id);
        if (!checkAnswer(c, answer)) {
          return interaction.reply({ content: 'Réponse incorrecte. Tu peux réessayer.', flags: ephemeral });
        }
        db.prepare('UPDATE duels SET status=?, winner_id=? WHERE id=? AND status=?')
          .run('completed', userId, duelId, 'pending');
        ensureProfile(userId);
        db.prepare('UPDATE profiles SET xp=xp+? WHERE user_id=?').run(Math.max(25, Math.floor(c.points / 2)), userId);
        await interaction.reply({
          content: `🏆 <@${userId}> remporte le duel **#${duelId}** et gagne ${Math.max(25, Math.floor(c.points / 2))} XP !`,
          allowedMentions: { users: [userId] }
        });
        break;
      }
    }
  } catch (error) {
    console.error('Erreur de commande:', error);
    const payload = { content: 'Une erreur est survenue. Réessaie dans un instant.', flags: ephemeral };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

async function startBot() {
  try {
    await registerCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Erreur de démarrage du bot :', error);
    process.exit(1);
  }
}

startBot();
