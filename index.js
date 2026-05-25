const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === 'hi') {
    message.reply('Hello!');
  }
});

client.login('MTUwODU3OTQ4ODQ0NjAyNTgzMA.GOQ2_S.Nw2qEGSOrXxLkuzo9L8f4tGZS0yMA-4rj_Q4ZY');
