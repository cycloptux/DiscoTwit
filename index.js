// Load environmental variables in .env file, if present
require("dotenv").config();

// Load main Discord.js library
const { Client } = require("discord.js");
// Create an instance of a Discord client
const Bot = new Client({
    partials: ["MESSAGE", "USER", "CHANNEL"],
    ws: {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
        ],
    },
});

// Load config settings for the Bot
const config = require("./config/config");
// Load Winston logger
const logger = require("./functions/winston");
// Load extra error handlers
require("./functions/errors");

// Import extra functions
const { commandHandler } = require("./functions/commands");
const { partialFetch } = require("./functions/helper");
const { initTwitterCredentials, tweetHandler } = require("./functions/twitter");

// Print an error log in the console if the WebSocket encounters an error
Bot.on("error", (err) => {
    logger.error(`[WebSocketError] ${err.message}${err.code ? ` [ ${err.code} ]${err.path ? ` (${err.path})` : ""}` : ""}: Trying to Reconnect...`);
});
Bot.on("warn", (warningMessage) => {
    logger.warn(`[Warning] ${JSON.stringify(warningMessage)}`);
});
Bot.on("debug", (debugMessage) => {
    if (/(Sending a heartbeat|Latency of)/i.test(debugMessage)) return null;
    if (/voice/i.test(debugMessage)) return null;
    logger.log("debug", debugMessage.toString().indexOf("429 hit on route") > -1 ? `[RateLimit] ${debugMessage}` : debugMessage);
});
Bot.on("rateLimit", (rateLimitInfo) => {
    logger.log("debug", `[RateLimit] ${typeof rateLimitInfo === "string" ? rateLimitInfo : JSON.stringify(rateLimitInfo)}`);
});

// The "ready" event is fired when the bot connects to Discord and starts receiving events
Bot.on("ready", () => {
    logger.info(`[Ready] Successfully connected to Discord as ${Bot.user.tag} (${Bot.user.id}).`);
    if (Bot.user.username !== config.generalSettings.bot_name) Bot.user.setUsername(config.generalSettings.bot_name).then((user) => logger.info(`[Ready] My new username is ${user.username}`));
    if (config.generalSettings.bot_activity && config.generalSettings.bot_activity.length) Bot.user.setActivity(config.generalSettings.bot_activity);
    initTwitterCredentials();
});

// Log an event if the bot joins or leaves a guild
Bot.on("guildCreate", (guild) => {
    logger.info(`[Internal] Server joined: ${guild.name} (${guild.id}).`);
});
Bot.on("guildDelete", (guild) => {
    logger.info(`[Internal] Server left: ${guild.name} (${guild.id}).`);
});

// Each message is handled by this event, process the message as a potential tweet post and/or a command if prefixed
Bot.on("message", async (message) => {
    // Ignore system messages, DMs and bots
    if (message.system) return;
    if (message.channel && message.channel.type === "dm") return;

    // If the message is partial or incomplete, try fetching it
    if (message.partial || !message.author) message = await partialFetch(message);

    // Sometimes, author and channel are only present after re-fetching, or not present at all. Check again
    if (!message.author) return;
    if (!message.channel || message.channel.type === "dm") return;

    // Check if the message satisfies Twitter-related permissions, or return internally
    tweetHandler(message);
    // Check if the message satisfies command-related permissions, or return internally
    commandHandler(message);
});

// Exit immediately if the token is missing
if (!config.generalSettings.bot_token || !config.generalSettings.bot_token.length) {
    logger.error("[Internal] Missing bot_token param. Check the README.md file for more details.");
    process.exit(9);
}

// Log the bot in
Bot.login(config.generalSettings.bot_token);
