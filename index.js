const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('pixel')
    .setDescription('Minecraft-style block filter')
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
    console.log('Slash command loaded');
  } catch (err) {
    console.error(err);
  }
});

// ===== MINECRAFT BLOCK PIXEL FILTER =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pixel') {
    await interaction.deferReply();

    const img = interaction.options.getAttachment('image');

    try {
      const res = await fetch(img.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      // 🧱 EXTREME MINECRAFT STYLE
      const output = await sharp(buffer)
        .resize({
          width: 8,
          height: 8,
          fit: 'inside',
          kernel: sharp.kernel.nearest
        })
        .resize({
          width: 512,
          height: 512,
          kernel: sharp.kernel.nearest
        })
        .toBuffer();

      await interaction.editReply({
        files: [{ attachment: output, name: 'minecraft.png' }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to process image.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
