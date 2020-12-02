// General bot parameters
const generalSettings = {
    bot_name: process.env.BOT_NAME || "DiscoTwit",
    bot_token: process.env.BOT_TOKEN || "",
    bot_prefix: process.env.BOT_PREFIX || "dt@",
    bot_activity: process.env.BOT_ACTIVITY || "",
};

// Discord bot configuration
const discordSettings = {
    server_id: process.env.SERVER_ID || "",
    channel_id: process.env.CHANNEL_ID || "",
    user_ids: process.env.USER_IDS ? process.env.USER_IDS.split(",") : [],
    react_on_success: process.env.REACT_ON_SUCCESS ? Boolean(process.env.REACT_ON_SUCCESS.toLowerCase() === "true") : true,
    reaction_emoji: process.env.REACTION_EMOJI || "✅",
};

// Twitter authentication and configuration
const twitterSettings = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || "",
    oauth_token: process.env.TWITTER_OAUTH_TOKEN || "",
    oauth_verifier: process.env.TWITTER_OAUTH_VERIFIER || "",
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || "",
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
};

// Log parameters
const logSettings = {
    level: process.env.LOG_LEVEL || "info", // Minimum logging level: debug, info
    console_colorize: process.env.LOG_CONSOLE_COLORIZE ? Boolean(process.env.LOG_CONSOLE_COLORIZE.toLowerCase() === "true") : true,
    local_enabled: Boolean(process.env.LOG_LOCAL_ENABLED && process.env.LOG_LOCAL_ENABLED.toLowerCase() === "true") || false,
    local_retention_days: (process.env.LOG_LOCAL_RETENTION && parseInt(process.env.LOG_LOCAL_RETENTION, 10) > 0 ? parseInt(process.env.LOG_LOCAL_RETENTION, 10) : false) || 7,
    local_json_format: process.env.LOG_LOCAL_JSON ? Boolean(process.env.LOG_LOCAL_JSON.toLowerCase() === "true") : true,
};

module.exports = {
    generalSettings,
    discordSettings,
    twitterSettings,
    logSettings,
};
