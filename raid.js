const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const raidSessions = new Map();

const RAID_LEVELS = {
  low: {
    label: 'Niveau 1 • léger',
    seconds: 30,
    color: 0x21A67B,
    title: 'Raid simulation • léger',
    summary: 'Faux scan et changements mineurs sur le serveur.',
    logSteps: ['scan', 'log', 'bruit', 'neutralisation'],
    roleName: 'glitch-light',
    phases: ['recon', 'noise', 'lockdown']
  },
  medium: {
    label: 'Niveau 2 • moyen',
    seconds: 60,
    color: 0xF7B955,
    title: 'Raid simulation • moyen',
    summary: 'Changement visible dans les salons et un rôle de démo.',
    logSteps: ['scan', 'payload', 'flood', 'décodage', 'neutralisation'],
    roleName: 'glitch-override',
    phases: ['recon', 'payload', 'escalation', 'lockdown']
  },
  urgent: {
    label: 'Niveau 3 • urgent',
    seconds: 120,
    color: 0xE74C3C,
    title: 'Raid simulation • urgent',
    summary: 'Incident critique simulé avec rôle, salon et permissions modifiées.',
    logSteps: ['scan', 'payload', 'flood', 'saturation', 'contre-mesure', 'neutralisation'],
    roleName: 'glitch-audit',
    phases: ['recon', 'payload', 'escalation', 'lockdown', 'panic']
  }
};

const RAID_PHASE_LABELS = {
  recon: 'Reconnaissance',
  payload: 'Payload',
  escalation: 'Escalade',
  lockdown: 'Lockdown',
  noise: 'Bruit',
  panic: 'Panic',
  drain: 'Drain',
  tamper: 'Tampering'
};

function normalizeLevel(rawLevel) {
  const value = String(rawLevel || 'medium').toLowerCase();
  return Object.prototype.hasOwnProperty.call(RAID_LEVELS, value) ? value : 'medium';
}

function getRaidStatusText(session) {
  if (!session) return 'Aucune simulation active.';
  return `Simulation **${session.level.toUpperCase()}** • ${session.status} • ${session.phase ? RAID_PHASE_LABELS[session.phase] || session.phase : 'récon'} • ${session.secondsLeft}s restants`;
}

function buildRaidDashboard(session, selectedLevel = 'medium') {
  const level = normalizeLevel(session?.level || selectedLevel);
  const config = RAID_LEVELS[level];
  const embed = new EmbedBuilder()
    .setColor(session ? 0xFF304F : 0x00D9FF)
    .setTitle(session ? 'GLITCH  /  INCIDENT EN COURS' : 'GLITCH  /  CENTRE DE SIMULATION')
    .setFooter({ text: 'SIMULATION CONTRÔLÉE  •  AUCUNE ATTAQUE RÉELLE' })
    .setTimestamp();

  if (!session) {
    return embed
      .setDescription('🟢 **Système prêt**\nChoisis un niveau, puis démarre la simulation.')
      .addFields(
        { name: 'NIVEAU SÉLECTIONNÉ', value: config.label, inline: true },
        { name: 'DURÉE', value: `${config.seconds}s`, inline: true },
        { name: 'MODE', value: 'Démo contrôlée', inline: true }
      );
  }

  const phaseName = RAID_PHASE_LABELS[session.phase] || session.phase || 'Recon';
  const percent = Math.max(0, Math.min(100, Math.round((session.secondsLeft / config.seconds) * 100)));
  const filledBlocks = Math.round(percent / 10);
  const recentLogs = session.log.slice(-3).map(line => `• ${line}`).join('\n') || 'Aucun événement enregistré.';

  return embed
    .setDescription(`🔴 **${config.label}**  ·  ${session.status === 'running' ? 'Simulation active' : session.status}`)
    .addFields(
      { name: 'PHASE', value: `🧭 ${phaseName}`, inline: true },
      { name: 'CHRONO', value: `⏱️ ${session.secondsLeft}s / ${config.seconds}s`, inline: true },
      { name: 'PROGRESSION', value: `\`${'█'.repeat(filledBlocks)}${'░'.repeat(10 - filledBlocks)}\`  **${percent}%**`, inline: false },
      { name: 'JOURNAL RÉCENT', value: recentLogs.slice(0, 1024), inline: false }
    );
}

function buildRaidPanel(level = 'medium', session = null) {
  const safeLevel = normalizeLevel(level);
  const currentPhase = session?.phase || 'recon';
  const phaseButtons = [
    ['recon', 'Recon'],
    ['payload', 'Payload'],
    ['escalation', 'Escalade'],
    ['lockdown', 'Lockdown'],
    ['noise', 'Bruit'],
    ['panic', 'Panic'],
    ['drain', 'Drain'],
    ['tamper', 'Tamper']
  ].map(([key, label]) =>
    new ButtonBuilder()
      .setCustomId(`phase_${key}`)
      .setLabel(label)
      .setStyle(key === currentPhase ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  return [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('raid_level_select')
        .setPlaceholder('Choisir le niveau de simulation')
        .addOptions(
          Object.entries(RAID_LEVELS).map(([key, data]) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(data.label)
              .setDescription(data.summary)
              .setValue(key)
              .setDefault(key === safeLevel)
          )
        )
    ),
    new ActionRowBuilder().addComponents(...phaseButtons.slice(0, 4)),
    new ActionRowBuilder().addComponents(...phaseButtons.slice(4, 8)),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('raid_start')
        .setLabel('Démarrer la simulation')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🚀'),
      new ButtonBuilder()
        .setCustomId('raid_stop')
        .setLabel('Stop / neutraliser')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🛡️'),
      new ButtonBuilder()
        .setCustomId('raid_logs')
        .setLabel('Voir les logs')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📜'),
      new ButtonBuilder()
        .setCustomId('raid_help')
        .setLabel('Help')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('❓')
    )
  ];
}

async function applyRaidEffects(guild, level) {
  if (!guild) return null;

  const safeLevel = normalizeLevel(level);
  const config = RAID_LEVELS[safeLevel];
  const targetChannel = guild.channels.cache.find(ch => ch.type === ChannelType.GuildText && ['general', 'chat', 'welcome', 'discussion', 'général', 'general-chat'].includes(ch.name.toLowerCase()))
    || guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).first();

  const everyoneRole = guild.roles.everyone;
  const originalOverwrite = targetChannel
    ? targetChannel.permissionOverwrites.cache.get(everyoneRole.id)
      ? targetChannel.permissionOverwrites.cache.get(everyoneRole.id).allow.toJSON()
      : null
    : null;

  const newRole = targetChannel && guild.roles.cache.find(r => r.name === config.roleName)
    ? guild.roles.cache.find(r => r.name === config.roleName)
    : await guild.roles.create({
        name: config.roleName,
        color: config.color,
        reason: 'Simulation de raid — défi de sécurité',
        mentionable: true
      }).catch(() => null);

  const tempChannel = targetChannel
    ? await guild.channels.create({
        name: `glitch-${safeLevel}-incident`,
        type: ChannelType.GuildText,
        parent: targetChannel.parentId,
        permissionOverwrites: [
          { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: newRole?.id ?? everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ],
        reason: 'Simulation de raid — défi de sécurité'
      }).catch(() => null)
    : null;

  if (targetChannel) {
    await targetChannel.setName(`${targetChannel.name}-override`).catch(() => {});
    await targetChannel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: false,
      ViewChannel: true,
      ReadMessageHistory: true,
      AddReactions: false
    }).catch(() => {});
  }

  return {
    roleId: newRole?.id ?? null,
    tempChannelId: tempChannel?.id ?? null,
    targetChannelId: targetChannel?.id ?? null,
    targetChannelName: targetChannel?.name ?? null,
    originalOverwrite,
    level: safeLevel
  };
}

async function rollbackRaidEffects(guild, effectState) {
  if (!guild || !effectState) return;

  if (effectState.roleId) {
    const role = guild.roles.cache.get(effectState.roleId);
    if (role) await role.delete('Neutralisation de la simulation raid').catch(() => {});
  }

  if (effectState.tempChannelId) {
    const tempChannel = guild.channels.cache.get(effectState.tempChannelId);
    if (tempChannel) await tempChannel.delete('Neutralisation de la simulation raid').catch(() => {});
  }

  if (effectState.targetChannelId) {
    const channel = guild.channels.cache.get(effectState.targetChannelId);
    if (channel) {
      if (effectState.targetChannelName && channel.name !== effectState.targetChannelName) {
        await channel.setName(effectState.targetChannelName).catch(() => {});
      }
      if (effectState.originalOverwrite) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, effectState.originalOverwrite).catch(() => {});
      }
    }
  }
}

function clearTimer(session) {
  if (session?.timeoutId) clearTimeout(session.timeoutId);
}

function setSessionPhase(session, phaseName) {
  if (!session || !phaseName) return;
  session.phase = phaseName;
  session.log.push(`🧭 Phase active : ${RAID_PHASE_LABELS[phaseName] || phaseName}`);
}

function stopRaidSession(userId) {
  let stopped = false;
  for (const [sessionId, session] of raidSessions.entries()) {
    if (session.userId !== userId) continue;
    clearTimer(session);
    session.status = 'stopped';
    session.log.push('⚠️ Simulation neutralisée par l’utilisateur.');
    raidSessions.delete(sessionId);
    stopped = true;
  }
  return stopped;
}

function startRaidSession({ userId, guildId, channelId, level, effectState = null }) {
  const safeLevel = normalizeLevel(level);
  const config = RAID_LEVELS[safeLevel];

  stopRaidSession(userId);

  const sessionId = `raid_${Date.now()}_${userId}`;
  const session = {
    id: sessionId,
    userId,
    guildId,
    channelId,
    level: safeLevel,
    status: 'running',
    secondsLeft: config.seconds,
    startedAt: Date.now(),
    effectState,
    phase: config.phases[0],
    phaseIndex: 0,
    log: [
      '🧪 Début d’un faux incident de sécurité.',
      `Niveau choisi : ${config.label}`,
      '📡 Analyse du flux du serveur : en cours',
      `🪪 Phase initiale : ${RAID_PHASE_LABELS[config.phases[0]]}`,
      '⚙️ Scan de permissions actif',
      '👁️ Ciblage des rôles / salons / canaux d’annonces'
    ]
  };

  raidSessions.set(sessionId, session);

  const tick = () => {
    const active = raidSessions.get(sessionId);
    if (!active || active.status !== 'running') return;

    active.secondsLeft = Math.max(0, active.secondsLeft - 10);
    const nextIndex = Math.min(config.phases.length - 1, active.phaseIndex + 1);
    active.phaseIndex = nextIndex;
    active.phase = config.phases[nextIndex];
    active.log.push(`📍 Phase avancée vers : ${RAID_PHASE_LABELS[active.phase] || active.phase}`);

    if (active.phase === 'payload') {
      active.log.push('⚠️ Injection de payload simulée détectée sur le canal principal.');
    }
    if (active.phase === 'escalation') {
      active.log.push('🔥 Escalade de privilèges simulée : vérification des permissions en cours.');
    }
    if (active.phase === 'lockdown') {
      active.log.push('🔒 Lockdown de démonstration : salon et rôle modifiés temporairement.');
    }
    if (active.phase === 'drain') {
      active.log.push('🌊 Drain de messages simulé : trafic artificiel en croissance.');
    }
    if (active.phase === 'panic') {
      active.log.push('🚨 Phase panic : alerte rouge déclenchée sur le tableau de bord.');
    }

    if (active.phase === 'panic' || active.secondsLeft <= 0) {
      clearTimer(active);
      active.status = 'expired';
      active.log.push('⏱️ Temps écoulé. La simulation est stoppée automatiquement.');
      raidSessions.delete(sessionId);
      return;
    }

    active.timeoutId = setTimeout(tick, 10000);
  };

  session.timeoutId = setTimeout(tick, 10000);
  return session;
}

function getActiveRaidSession(userId) {
  for (const session of raidSessions.values()) {
    if (session.userId === userId) return session;
  }
  return null;
}

function getRaidLogSummary(userId) {
  const session = getActiveRaidSession(userId);
  if (!session) return 'Aucune simulation active en cours pour ce membre.';
  return session.log.slice(-8).join('\n');
}

module.exports = {
  RAID_LEVELS,
  RAID_PHASE_LABELS,
  raidSessions,
  buildRaidPanel,
  applyRaidEffects,
  rollbackRaidEffects,
  startRaidSession,
  stopRaidSession,
  setSessionPhase,
  getActiveRaidSession,
  buildRaidDashboard,
  getRaidStatusText,
  getRaidLogSummary,
  normalizeLevel
};
