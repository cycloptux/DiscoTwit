const config = require("../config/config");
const logger = require("./winston");

// Individual commands logic
const _commandsLogic = {
    help: (message) => {
        const response_text = "Test";
        return message.channel.send(response_text);
    },
};

const commandHandler = (message) => {
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
