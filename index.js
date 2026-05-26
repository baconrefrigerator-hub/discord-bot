const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== REGISTER SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('pixel')
    .setDescription('Pixelate an image')
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
    console.log('Slash commands registered');
  } catch (err) {
    console.error(err);
  }
});

// ===== PIXEL COMMAND =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pixel') {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('image');

    try {
      const response = await fetch(attachment.url);
      const buffer = Buffer.from(await response.arrayBuffer());

      const pixelated = await sharp(buffer)
        .resize({ width: 32, height: 32, fit: 'inside' })
        .resize({ width: 512, height: 512, kernel: sharp.kernel.nearest })
        .toBuffer();

      await interaction.editReply({
        files: [{ attachment: pixelated, name: 'pixel.png' }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to pixelate image.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
