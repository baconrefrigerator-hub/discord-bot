const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const https = require('https');

const ROLE_ID = '1508687596555993148';
const WIN_CHANCE = 0.15;
const SECRET_DOG_URL = 'https://cdn.discordapp.com/attachments/1508689243537539224/1508693874598477884/image0.jpg?ex=6a167829&is=6a1526a9&hm=7be8a8dd9d94f83280fe72c2ededed4b71c12dfa4e3ffe9c6d839e152479ec22&';

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!clear_all') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You need to be an admin to use this command!');
    }

    await message.delete();

    let deleted;
    do {
      deleted = await message.channel.bulkDelete(100, true);
    } while (deleted.size >= 2);

    const notice = await message.channel.send('🧹 Channel cleared!');
    setTimeout(() => notice.delete(), 3000);
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
