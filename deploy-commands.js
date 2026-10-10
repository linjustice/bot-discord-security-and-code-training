require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { commands } = require('./commands');

function applyCliOverrides() {
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const name = token.slice(2);
    const value = name.includes('=') ? name.split('=').slice(1).join('=') : argv[i + 1];
    const key = name.split('=')[0];

    if (!value || value.startsWith('--')) continue;

    if (key === 'token') process.env.DISCORD_TOKEN = value;
    if (key === 'client-id') process.env.CLIENT_ID = value;
    if (key === 'guild-id') process.env.GUILD_ID = value;
    if (key === 'clientId') process.env.CLIENT_ID = value;
    if (key === 'guildId') process.env.GUILD_ID = value;

    if (name.includes('=')) continue;
    i += 1;
  }
}

async function registerCommands() {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
  if (!DISCORD_TOKEN || !CLIENT_ID) {
    throw new Error('Configure DISCORD_TOKEN et CLIENT_ID dans .env ou passe --token et --client-id dans le terminal.');
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log(`Commandes enregistrées sur le serveur ${GUILD_ID}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log('Commandes globales enregistrées. Leur propagation peut prendre du temps.');
}

if (require.main === module) {
  applyCliOverrides();
  registerCommands().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { registerCommands, applyCliOverrides };
