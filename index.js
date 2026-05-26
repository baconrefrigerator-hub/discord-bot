const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Check your ping!"),
  new SlashCommandBuilder().setName("dead").setDescription("Ping everyone and ask if they're dead!"),
].map((cmd) => cmd.toJSON());

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log("Slash commands registered!");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "hey") {
    message.reply("Hi!");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    const ping = client.ws.ping;
    await interaction.reply(`🏓 Pong! Your ping is **${ping}ms**`);
  }

  if (interaction.commandName === "dead") {
    await interaction.reply("@everyone dead?");
  }
});

client.login(process.env.TOKEN);
