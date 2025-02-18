const fs = require("fs")
const package_data = JSON.parse(fs.readFileSync("package.json", "utf8"))
const version = package_data.version
const { get_questions } = require("../modules/trivia");
const { send_client_error } = require("../modules/error");
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const discord_reactions = {
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "9": "9️⃣",
    "start": "✅",
    "stop": "🛑",
    "next": "⏩",
    "restart": "🔁"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("Start a trivia based on space related questions.")
        .addIntegerOption(option =>
            option.setName("number_of_questions")
                .setDescription("The number of questions you want to ask.")
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("difficulty")
                .setDescription("The difficulty of the trivia questions.")
                .setRequired(false)
                .addChoices(
                    { name: "Random", value: "random" },
                    { name: "Easy", value: "easy" },
                    { name: "Medium", value: "medium" },
                    { name: "Hard", value: "hard" }
                )
        )
        .addStringOption(option =>
            option.setName("public_private")
                .setDescription("Choose if the trivia is public or private.")
                .setRequired(false)
                .addChoices(
                    { name: "Public", value: "public" },
                    { name: "Public (With Friends)", value: "public_with_friends" },
                    { name: "Private", value: "private" }
                )
        ),
    async execute(interaction) {
        let number_of_questions = interaction.options.getInteger("number_of_questions") || 10;
        let difficulty = interaction.options.getString("difficulty") || "random";
        let public_private = interaction.options.getString("public_private") || "public";

        let questions = get_questions(number_of_questions, difficulty);
        if (questions < 1) {
            console.error("Error | Failed To Load Questions | No Questions Found");
            await send_client_error(interaction, "error", "No questions found for the specified difficulty.");
            return;
        }

        let total_score = 0;

        let type = "Unknown";

        if (public_private === "public") {
            type = "Public";
        } else if (public_private === "public_with_friends") {
            type = "Public (With Friends)";
        } else {
            type = "Private";
        }

        // let question_fields = [
        //     {
        //         name: "Question " + (i + 1) + ":",
        //         value: questions[i].question,
        //     }
        // ];
        //
        // for (let choice in questions[i].choices) {
        //     question_fields.push({
        //         name: "Option " + choice + ":",
        //         value: questions[i].choices[choice]
        //     });
        // }

        const trivia_embed = new EmbedBuilder()
            .setColor(0x0E0E0E)
            .setTitle("Cosmic Bot | Space Trivia")
            .setDescription("Type: " + type + "\nQuestion Amount: " + questions.length + " (" + number_of_questions + " Requested)\nDifficulty: " + difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + "\n\nSelect " + discord_reactions["start"] + " **Start** to start the trivia.\nor " + discord_reactions["stop"] + " **Cancel** to close the trivia.")
            .setThumbnail("https://google.com")
            .setTimestamp()
            .setFooter({
                text: "Cosmic Bot | Version: " + version,
                iconURL: "https://google.com"
            });

        const start_button = new ButtonBuilder()
            .setCustomId("start_trivia")
            .setLabel("Start")
            .setStyle("3");

        const stop_button = new ButtonBuilder()
            .setCustomId("stop_trivia")
            .setLabel("Cancel")
            .setStyle("4");

        const row = new ActionRowBuilder()
            .addComponents(start_button, stop_button);

        let response = null;

        if (public_private === "public" || public_private === "public_with_friends") {
            response = await interaction.reply({
                embeds: [trivia_embed],
                components: [row],
                withResponse: true
            });
        } else {
            response = await interaction.reply({
                embeds: [trivia_embed],
                components: [row],
                withResponse: true,
                flags: 64
            });
        }

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1500 });

        const trivia_cancelled_embed = new EmbedBuilder()
            .setColor(0xC91D1D)
            .setTitle("Cosmic Bot | Trivia Cancelled")
            .setDescription("The trivia has been cancelled / timed out.\nUse /trivia (parameters) to make a new game.")
            .setTimestamp()
            .setFooter({
                text: "Cosmic Bot | Version: " + version,
                iconURL: "https://www.google.com"
            });

        collector.on("collect", async message => {
            if (message.customId === "start_trivia") {
                await message.update({
                    content: "Trivia Started",
                    components: []
                });
            } else if (message.customId === "stop_trivia") {
                try {
                    message.update({
                        embeds: [trivia_cancelled_embed],
                        components: []
                    });
                } catch (error) {
                    console.error("Error | Issue Updating Message | Error: " + error);
                }
            }
        });

        collector.on("end", async collected => {
            if (collected.size < 1) {
                try {
                    const original_message = await interaction.fetchReply();
                    await original_message.edit({
                        embeds: [trivia_cancelled_embed],
                        components: []
                    });
                } catch (error) {
                    console.error("Error | Issue Editing Message | Error: " + error);
                }
            }
        });
    }
}