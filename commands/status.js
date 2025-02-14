const fs = require("fs")
const package_data = JSON.parse(fs.readFileSync("package.json", 'utf8'))
const version = package_data.version
const node_version = require("node:process").version;
const { get_up_time } = require("../modules/uptime");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Replies with various diagnostic info & information about the bot."),
    async execute(interaction) {
        let ping = Date.now() - interaction.createdTimestamp;
        if (!ping) {
            ping = "N/A";
        } else if (ping < 0) {
            ping = "0";
        }

        const status_embed = new EmbedBuilder()
            .setColor(0x1F292E)
            .setTitle("Cosmic Bot | Status & Diagnostic Information")
            .setDescription("Here is some useful information about the bot. As well as some diagnostic information (for developers).")
            .setThumbnail("https://google.com")
            .addFields(
                {
                    name: "Bot Uptime:",
                    value: get_up_time(),
                },
                {
                    name: "Ping / Latency:",
                    value: ping + "ms",
                },
                {
                    name: "Server Count:",
                    value: interaction.client.guilds.cache.size
                },
                {
                    name: "CPU Architecture:",
                    value: require("os").arch()
                },
                {
                    name: "CPU Model:",
                    value: require("os").cpus()[0].model
                },
                {
                    name: "Operating System:",
                    value: require("os").type()
                },
                {
                    name: "Operating System Version:",
                    value: require("os").release()
                },
                {
                    name: "Memory Usage:",
                    value: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB"
                },
                {
                    name: "Bot Version:",
                    value: version
                },
                {
                    name: "Node Version:",
                    value: node_version
                },
                {
                    name: "Support URL:",
                    value: "(Replace This)"
                },
                {
                    name: "Invite URL:",
                    value: "(Replace This)"
                },
                {
                    name: "GitHub URL:",
                    value: "(Replace This)"
                }
            )
            .setTimestamp()
            .setFooter({
                text: "Cosmic Bot | Version: " + version,
                iconURL: "https://google.com"
            });

        await interaction.reply({
            embeds: [status_embed],
            flags: 64
        });
    }
}