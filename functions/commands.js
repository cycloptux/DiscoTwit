const config = require("../config/config");
const logger = require("./winston");
const { truncateText } = require("./helper");

// Individual commands logic
const _commandsLogic = {
    help: (message) => {
        const response_text = truncateText("**DiscoTwit** is an **open source**, customizable **Discord-to-Twitter** integration bot whose goal is to tweet messages posted on Discord.\n"
            + "You can find my source code here: https://github.com/cycloptux/DiscoTwit\n\n"
            + "Here's my current configuration:\n"
            + `- **Server ID:** \`${config.discordSettings.server_id}\`\n`
            + `- **Channel ID:** \`${config.discordSettings.channel_id}\`\n`
            + `- **User ID(s):** \`${config.discordSettings.user_ids.join(" ")}\`\n`
            + `- **React on Success:** \`${Boolean(config.discordSettings.react_on_success)}\`\n`
            + `- **Reaction Emoji:** \`${config.discordSettings.reaction_emoji}\`\n`, 2000);
        return message.channel.send(response_text);
    },
};

const commandHandler = (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Ignore messages with no content
    if (!message.content || !message.content.length || !message.content.trim().length) return;

    const botPrefix = config.generalSettings.bot_prefix;
    // Ignore any message that does not start with the prefix
    if (message.content.indexOf(botPrefix) !== 0) return;

    // Separate the command name from its arguments
    const args = message.content.slice(botPrefix.length).trim().split(/ +/g);
    // Add a fake character to avoid that a space in between the prefix and the command is ignored (due to .trim())
    if (message.content.slice(botPrefix.length).indexOf(args[0])) args.splice(0, 0, "");

    // Isolate the actual command, return if no command
    let command = args.shift();
    if (command && command.length) command = command.toLowerCase();
    else return;

    // Return on unknown commands
    if (!Object.keys(_commandsLogic).includes(command)) return;

    // Log and execute the command response
    logger.info(`[Command Request] From ${message.author.tag} (${message.author.id}), Command [ ${command} ] in Server ${message.guild.name} (${message.guild.id}), Channel #${message.channel.name} (${message.channel.id}), `
        + `Message ID [ ${message.id} ].`);
    return _commandsLogic[command](message);
};

module.exports = {
    commandHandler,
};
