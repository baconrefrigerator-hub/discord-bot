const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Add or remove words from this list as needed
const bannedWords = [
  'word1', 'word2', 'word3' // replace with actual words you want to filter
];

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  const foundBannedWord = bannedWords.some((word) =>
    content.includes(word)
  );

  if (foundBannedWord) {
    try {
      await message.delete();
      const warning = await message.channel.send(
        `⚠️ ${message.author}, watch your language!`
      );

      // Auto-delete the warning after 5 seconds
      setTimeout(() => warning.delete(), 5000);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
