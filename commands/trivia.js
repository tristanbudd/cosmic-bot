const fs = require("fs")
const package_data = JSON.parse(fs.readFileSync("package.json", 'utf8'))
const version = package_data.version
const { get_questions } = require("../modules/trivia");
const { send_client_error } = require("../modules/error");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
            await send_client_error(interaction, "error", "No questions found for the specified difficulty.");
            return;
        }

        await interaction.reply({
            content: "Trivia started! Number of questions: " + number_of_questions + " | Difficulty: " + difficulty + " | Public/Private: " + public_private + " | Questions: " + questions.length + " | First Question: " + questions[0].question,
        });
    }
}