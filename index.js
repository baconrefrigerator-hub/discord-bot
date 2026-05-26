const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const https = require('https');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random dog picture! 🐶')
    .toJSON(),
];

// Register slash commands when bot is ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'dog') {
    await interaction.deferReply();

    // Fetch a random dog image from the Dog CEO API
    const url = 'https://dog.ceo/api/breeds/image/random';

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', async () => {
        try {
          const json = JSON.parse(data);
          await interaction.editReply({
            content: '🐶 Here is your dog!',
            embeds: [{
              image: { url: json.message },
              color: 0xf4a460,
            }]
          });
        } catch (err) {
          await interaction.editReply('❌ Couldn\'t fetch a dog pic, try again!');
        }
      });
    }).on('error', async () => {
      await interaction.editReply('❌ Something went wrong, try again!');
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
