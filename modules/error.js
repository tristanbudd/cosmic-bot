const {EmbedBuilder} = require("discord.js");

async function send_client_error(data, error_type, error) {
    if (!data || !error_type || !error || !data.user || !data.user.tag) {
        console.error("Error | Issue Sending Clientside Error | Missing Data");
        return;
    }

    // Icons sourced by: https://fontawesome.com/ (CC 4.0 License)
    const error_thumbnail = (error_type.toLowerCase() === "error" ? "https://raw.githubusercontent.com/tristanbudd/cosmic-bot/master/assets/error.png" : "https://raw.githubusercontent.com/tristanbudd/cosmic-bot/master/assets/warning.png");

    const error_embed = new EmbedBuilder()
        .setColor(error_type.toLowerCase() === "error" ? 0xC91D1D : 0xE8B130)
        .setTitle("Cosmic Bot | " + error_type.charAt(0).toUpperCase() + error_type.slice(1).toLowerCase() + " Notice")
        .setDescription("An Error Has Occurred While Processing Your Request.")
        .setThumbnail(error_thumbnail)
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

module.exports = {
    send_client_error
}