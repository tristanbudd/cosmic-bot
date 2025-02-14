require("dotenv").config()
const fs = require("node:fs");
const path = require("node:path");
const package_data = JSON.parse(fs.readFileSync("package.json", 'utf8'))
const version = package_data.version
const { set_start_time } = require("./modules/uptime");
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder  } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
});

/* Standardised Clientside Error Messages */
async function send_client_error(data, error_type, error) {
    if (!data || !error_type || !error || !data.user || !data.user.tag) {
        console.error("Error | Issue Sending Clientside Error | Missing Data");
        return;
    }

    const error_embed = new EmbedBuilder()
        .setColor(error_type.toLowerCase() === "error" ? 0xC91D1D : 0xE8B130)
        .setTitle("Cosmic Bot | " + error_type.charAt(0).toUpperCase() + error_type.slice(1).toLowerCase() + " Notice")
        .setDescription("An Error Has Occurred While Processing Your Request.")
        .setThumbnail("https://google.com")
        .addFields(
            {
                name: "Error Type:",
                value: error_type.charAt(0).toUpperCase() + error_type.slice(1).toLowerCase() + (error_type.toLowerCase() === "error" ? " (Something went completely wrong, and needs fixing)" : " (Can be generally ignored, if causing any issues please report)")
            },
            {
                name: "Error Data:",
                value: String(error).length > 1024 ? String(error).substring(0, 1024) + "..." : String(error)
            },
            {
                name: "Error Timestamp:",
                value: "<t:" + Math.floor(Date.now() / 1000) + ">"
            },
            {
                name: "Support URL:",
                value: "(Replace This)"
            }
        )
        .setTimestamp()
        .setFooter({
            text: "Cosmic Bot | Version: " + version,
            iconURL: "https://www.google.com"
        });

    if (data.replied || data.deferred) {
        await data.followUp({
            embeds: [error_embed],
            flags: 64
        });
    } else {
        await data.reply({
            embeds: [error_embed],
            flags: 64
        });
    }
}

/* Creating a Collection to Store Commands */
client.commands = new Collection();

const folder_path = path.join(__dirname, 'commands');
const command_files = fs.readdirSync(folder_path).filter(file => file.endsWith('.js'));

for (const file of command_files) {
    const command_path = path.join(folder_path, file);
    const command_files = require(command_path);

    if ("data" in command_files && "execute" in command_files) {
        client.commands.set(command_files.data.name, command_files);
    } else {
        console.error("Error | Failed To Load Command: " + file + " (" + command_path + ")");
        console.error("| Reason: Missing 'data' or 'execute' Property.");
    }
}

/* Command Registration */
client.on(Events.ClientReady, () => {
    console.log("Command Registration | Beginning The Registration Process: ");
    client.guilds.cache.forEach(guild => {
        guild.commands.set(client.commands.map(command => command.data)).then(_ => {
            console.log("| Successfully Registered Commands In: " + guild.name);
        });
    });
    console.log("Command Registration | Successfully Registered: " + client.commands.size + " Command(s) In: " + client.guilds.cache.size + " Server(s)");
});

/* Bot Interaction Event */
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        if (interaction.user && interaction.user.tag) {
            send_client_error(interaction, "warning", "Command Not Found: " + interaction.commandName)
                .then(() => {
                    console.log("Client Error Notice | Successfully Send Clientside Error Notice");
                })
                .catch(error => {
                    console.error("Error | Issue Sending Clientside Error Notice");
                    console.error("| Reason: " + error);
                });
            console.error("Client Error (" + interaction.user.tag + ") | Command Not Found: " + interaction.commandName);
        } else {
            console.error("Client Error (Unknown User) | Command Not Found: " + interaction.commandName);
        }
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error("Error | Issue Executing Command: " + interaction.commandName + " | Error: " + error);
        send_client_error(interaction, "error", error)
            .then(() => {
                console.log("Client Error Notice | Successfully Send Clientside Error Notice");
            })
            .catch(error => {
                console.error("Error | Issue Sending Clientside Error Notice");
                console.error("| Reason: " + error);
            });
    }
});

/* Bot Online & Ready Event */
client.once(Events.ClientReady, client_data => {
    set_start_time()

    setTimeout(() => {
        console.log(" ")
        console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
        console.log("Cosmic Bot | Ready & Online")
        console.log(" ")
        console.log("Bot Information |")
        console.log("| Bot Tag: " + client_data.user.tag)
        console.log("| Bot ID: " + client_data.user.id)
        console.log("| Server Count: " + client_data.guilds.cache.size + " Server(s)")
        console.log("| Command Count: " + client.commands.size + " Command(s)")
        console.log(" ")
        console.log("Bot Support |")
        console.log("| Invite URL: (Replace This)")
        console.log("| Support URL: (Replace This)")
        console.log("| Github URL: (Replace This)")
        console.log("| Bot By: Tristan Budd (https://github.com/tristanbudd)")
        console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    }, 1000);
});

/* Bot Authentication */
client.login(process.env.BOT_TOKEN)
    .then(() => {
        console.log("Authentication | Login Successful!");
    })
    .catch(error => {
        console.error("Authentication | Error Logging In:" + error);
    });