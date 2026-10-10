const { SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('missions')
    .setDescription('Affiche les challenges disponibles')
    .addStringOption(o => o.setName('categorie').setDescription('Filtrer les missions')
      .addChoices(
        { name: 'Toutes', value: 'all' },
        { name: 'Code', value: 'code' },
        { name: 'Cyber', value: 'cyber' },
        { name: 'Forensics', value: 'forensics' }
      )),
  new SlashCommandBuilder()
    .setName('challenge')
    .setDescription('Affiche un challenge')
    .addStringOption(o => o.setName('id').setDescription('ID de la mission').setRequired(true)),
  new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Soumets une réponse ou un flag')
    .addStringOption(o => o.setName('id').setDescription('ID de la mission').setRequired(true))
    .addStringOption(o => o.setName('reponse').setDescription('Ta réponse ou ton flag').setRequired(true)),
  new SlashCommandBuilder()
    .setName('hint')
    .setDescription('Obtiens un indice pour une mission')
    .addStringOption(o => o.setName('id').setDescription('ID de la mission').setRequired(true)),
  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Affiche ton profil GLITCH')
    .addUserOption(o => o.setName('membre').setDescription('Profil à consulter')),
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement du serveur'),
  new SlashCommandBuilder()
    .setName('duels')
    .setDescription('Affiche tous les duels enregistrés'),
  new SlashCommandBuilder()
    .setName('duel')
    .setDescription('Défie un membre sur un challenge')
    .addUserOption(o => o.setName('membre').setDescription('Adversaire').setRequired(true))
    .addStringOption(o => o.setName('id').setDescription('ID du challenge').setRequired(true)),
  new SlashCommandBuilder()
    .setName('duel-answer')
    .setDescription('Réponds à ton duel actif')
    .addIntegerOption(o => o.setName('id').setDescription('ID du duel').setRequired(true))
    .addStringOption(o => o.setName('reponse').setDescription('Ta réponse').setRequired(true)),
  new SlashCommandBuilder()
    .setName('raid-sim')
    .setDescription('Ouvre un panneau de simulation de raid en mode démo')
    .addStringOption(o => o.setName('niveau').setDescription('Niveau de simulation').addChoices(
      { name: 'Léger', value: 'low' },
      { name: 'Moyen', value: 'medium' },
      { name: 'Urgent', value: 'urgent' }
    )),
  new SlashCommandBuilder()
    .setName('raid-status')
    .setDescription('Affiche l’état de la simulation active'),
  new SlashCommandBuilder()
    .setName('raid-stop')
    .setDescription('Neutralise immédiatement la simulation active'),
  new SlashCommandBuilder()
    .setName('raid-help')
    .setDescription('Explique comment lire les logs et désactiver la simulation'),
  new SlashCommandBuilder()
    .setName('glitch-start')
    .setDescription('Affiche le guide de démarrage')
].map(c => c.toJSON());

module.exports = { commands };
