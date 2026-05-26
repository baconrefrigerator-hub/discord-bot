const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const https = require('https');

const ROLE_ID = '1508687596555993148';
const WIN_CHANCE = 0.15; // 15%
const SECRET_DOG_URL = 'https://images.dog.ceo/breeds/rottweiler/n02106550_107.jpg';

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
    .setDescription('Get a random dog picture! 🐶 Land the secret dog to win a role!')
    .toJSON(),
];

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

    const isWinner = Math.random() < WIN_CHANCE;

    if (isWinner) {
      try {
        await interaction.member.roles.add(ROLE_ID);
        await interaction.editReply({
          content: `🎉 **YOU FOUND THE SECRET DOG!** You've been given the <@&${ROLE_ID}> role!`,
          embeds: [{
            image: { url: SECRET_DOG_URL },
            color: 0xffd700,
            footer: { text: '🏆 Lucky winner!' },
          }]
        });
      } catch (roleErr) {
        console.error('Failed to assign role:', roleErr);
        await interaction.editReply('🐶 You won but I couldn\'t assign the role — check bot permissions!');
      }
      return;
    }

    // Non-winner gets a random dog
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
              footer: { text: 'Keep trying for a secret reward...' },
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
