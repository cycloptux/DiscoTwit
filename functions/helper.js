const logger = require("./winston");

const partialFetch = (message) => {
    // Return the message immediately if the bot doesn't have enough permissions to re-fetch
    if (["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"].some((x) => !message.channel.permissionsFor(message.guild.me).has(x))) {
        logger.log("debug", `[Partial Fetch: Message] Error while fetching [ ${message.id ? message.id : JSON.stringify(message)} ]: Missing access to channel.`);
        return Promise.resolve(message);
    }
    return message.fetch().catch((err) => {
        logger.log("debug", `[Partial Fetch: Message] Error while fetching [ ${message.id ? message.id : JSON.stringify(message)} ]: ${err.message ? err.message : err}.`);
        return message;
    });
};

const truncateText = (text, chars = 280, append_text = "...") => {
    if (text.length > chars) return text.slice(0, chars - append_text.length) + append_text;
    return text;
};

module.exports = {
    partialFetch,
    truncateText,
};
