const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('wordimg')
    .setDescription('Adds a random word on an image')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Upload an image')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash command registered');
  } catch (err) {
    console.error(err);
  }
});

// ===== RANDOM WORDS =====
const words = [
  "LOL", "EPIC", "WOW", "BRUH", "SKIBIDI", "NOOB", "WIN", "FAIL", "OMG", "CRAZY"
];

function randomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// ===== IMAGE PROCESS =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'wordimg') {
    await interaction.deferReply();

    const img = interaction.options.getAttachment('image');

    try {
      const res = await fetch(img.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      const word = randomWord();

      const image = await sharp(buffer)
        .resize(512, 512)
        .composite([
          {
            input: Buffer.from(
              `<svg width="512" height="512">
                <text x="50%" y="50%" font-size="60"
                fill="white" stroke="black" stroke-width="2"
                text-anchor="middle">${word}</text>
              </svg>`
            ),
            top: 0,
            left: 0
          }
        ])
        .toBuffer();

      await interaction.editReply({
        files: [{ attachment: image, name: 'word.png' }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to edit image.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
