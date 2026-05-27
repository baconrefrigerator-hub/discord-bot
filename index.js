const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('boxes')
    .setDescription('Adds random boxes on an image')
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

// ===== RANDOM BOXES =====
function generateBoxes() {
  let svg = `<svg width="512" height="512">`;

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = 40 + Math.random() * 140;

    const color = `rgba(${Math.floor(Math.random()*255)},
                         ${Math.floor(Math.random()*255)},
                         ${Math.floor(Math.random()*255)},
                         0.6)`;

    svg += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" />`;
  }

  svg += `</svg>`;
  return Buffer.from(svg);
}

// ===== IMAGE COMMAND =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'boxes') {
    await interaction.deferReply();

    const img = interaction.options.getAttachment('image');

    try {
      const res = await fetch(img.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      const output = await sharp(buffer)
        .resize(512, 512)
        .composite([
          {
            input: generateBoxes(),
            top: 0,
            left: 0
          }
        ])
        .toBuffer();

      await interaction.editReply({
        files: [{ attachment: output, name: 'boxes.png' }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to process image.');
    }
  }
});

// ===== ROBUX AUTO REPLY =====
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg.includes('robux')) {
    message.reply('NAHHH YOU POOR NGL! 💀');
  }
});

client.login(process.env.DISCORD_TOKEN);
