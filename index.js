const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMAND SETUP =====
const commands = [
  new SlashCommandBuilder()
    .setName('pixel')
    .setDescription('Turn an image into extreme pixel art')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Upload an image')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

// Register commands
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

// ===== PIXEL COMMAND =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pixel') {
    await interaction.deferReply();

    const image = interaction.options.getAttachment('image');

    try {
      const res = await fetch(image.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      // 🔥 EXTREME PIXEL EFFECT
      const output = await sharp(buffer)
        .resize({ width: 8, height: 8, fit: 'inside' }) // SUPER low resolution
        .resize({ width: 512, height: 512, kernel: sharp.kernel.nearest }) // scale up hard pixels
        .toBuffer();

      await interaction.editReply({
        files: [{ attachment: output, name: 'pixel.png' }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to pixelate image.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
