const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const https = require('https');

const ROLE_ID = '1508687596555993148';
const WIN_CHANCE = 0.15; // 15%

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

    // 15% chance to show the winning Rottweiler
    const isWinner = Math.random() < WIN_CHANCE;

    const url = isWinner
      ? 'https://dog.ceo/api/breed/rottweiler/images/random'
      : 'https://dog.ceo/api/breeds/image/random';

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', async () => {
        try {
          const json = JSON.parse(data);
          const imageUrl = json.message;

          let content = '🐶 Here is your dog!';
          let color = 0xf4a460;

          if (isWinner) {
            try {
              await interaction.member.roles.add(ROLE_ID);
              content = `🎉 **YOU FOUND THE SECRET DOG!** You've been given the <@&${ROLE_ID}> role!`;
              color = 0xffd700;
            } catch (roleErr) {
              console.error('Failed to assign role:', roleErr);
              content = '🐶 Here is your dog! (Couldn\'t assign role — check bot permissions)';
            }
          }

          await interaction.editReply({
            content,
            embeds: [{
              image: { url: imageUrl },
              color,
              footer: isWinner
                ? { text: '🏆 Lucky winner!' }
                : { text: 'Keep trying for a secret reward...' },
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
