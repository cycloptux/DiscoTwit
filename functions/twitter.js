// This is already used in the index.js file when the bot is started, but is also required for the OAuth script
require("dotenv").config();

const fs = require("fs");
const Twitter = require("twitter-lite");
const Bottleneck = require("bottleneck");

const config = require("../config/config");
const { truncateText } = require("./helper");
const logger = require("./winston");

const oauthUrl = "https://api.twitter.com/oauth/authenticate?oauth_token=";
const oauthFilePath = "./config/twitter_credentials.json";

if (!config.twitterSettings.consumer_key || !config.twitterSettings.consumer_key.length || !config.twitterSettings.consumer_secret || !config.twitterSettings.consumer_secret.length) {
    logger.error("[Twitter] Missing consumer_key and/or consumer_secret Twitter authentication params. Check the README.md file for more details.");
    process.exit(9);
}

// Internal rate limiter
// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update
const statusesUpdateLimiter = new Bottleneck({
    minTime: 36720, // 300 request per 3 hours = 1 request per 36 seconds = 1 request per 36000 milliseconds. This is slowed down by 2%, at 1 request per 36720 ms.
    maxConcurrent: 1, // If there's a chance some requests might take longer than 36720 ms, this prevents more than 1 request from running at a time.
});

const clientParams = {
    consumer_key: config.twitterSettings.consumer_key,
    consumer_secret: config.twitterSettings.consumer_secret,
};
if (config.twitterSettings.access_token_key && config.twitterSettings.access_token_key.length && config.twitterSettings.access_token_secret && config.twitterSettings.access_token_secret.length) {
    Object.assign(clientParams, {
        access_token_key: config.twitterSettings.access_token_key,
        access_token_secret: config.twitterSettings.access_token_secret,
    });
} else if (fs.existsSync(oauthFilePath)) {
    try {
        const oauthLocal = JSON.parse(fs.readFileSync(oauthFilePath, "utf8"));
        Object.assign(clientParams, {
            access_token_key: oauthLocal.oauth_token,
            access_token_secret: oauthLocal.oauth_token_secret,
        });
    } catch (e) {
        // Ignore malformed data
    }
}
let userInfo;
let twitterClient = new Twitter(clientParams);

const _verifyCredentials = () => (userInfo ? Promise.resolve(true) : twitterClient.get("account/verify_credentials").then((results) => {
    userInfo = results;
    logger.info(`[Twitter] Successfully connected to Twitter as @${userInfo.screen_name} (${userInfo.id_str}).`);
    return true;
}).catch((err) => {
    let error_string;
    let exit_code;
    if (err.errors && err.errors.length) {
        error_string = err.errors.map((error) => `${error.message} [Code ${error.code}]`).join(" ");
        exit_code = 9;
    } else {
        error_string = `${err.message ? err.message : err}.`;
        exit_code = 1;
    }
    logger.error(`[Twitter] Failed to connect to Twitter: ${error_string}`);
    return process.exit(exit_code);
}));
const _setAccessToken = () => {
    if (clientParams.access_token_key && clientParams.access_token_key.length && clientParams.access_token_secret && clientParams.access_token_secret.length) return Promise.resolve(true);
    if (!config.twitterSettings.oauth_token || !config.twitterSettings.oauth_token.length || !config.twitterSettings.oauth_verifier || !config.twitterSettings.oauth_verifier.length) {
        logger.error("[Twitter] Missing oauth_token and/or oauth_verifier Twitter authentication params. Please run \"npm run auth\" and follow the instructions.");
        return process.exit(9);
    }
    return twitterClient.getAccessToken({
        oauth_token: config.twitterSettings.oauth_token,
        oauth_verifier: config.twitterSettings.oauth_verifier,
    }).then((res) => {
        fs.writeFileSync(oauthFilePath, JSON.stringify(res), "utf8");
        logger.info(`[Twitter] Successfully authenticated with Twitter as @${res.screen_name} (${res.user_id}).`);
        logger.info(`[Twitter] Saved authentication data locally in [ ${oauthFilePath} ]. !!! KEEP THIS FILE SAFE !!!`);
        Object.assign(clientParams, {
            access_token_key: res.oauth_token,
            access_token_secret: res.oauth_token_secret,
        });
        twitterClient = new Twitter(clientParams);
        return true;
    }).catch((err) => {
        let error_string;
        let exit_code;
        if (err.errors && err.errors.length) {
            error_string = err.errors.map((error) => `${error.message} [Code ${error.code}]`).join(" ");
            exit_code = 9;
        } else {
            error_string = `${err.message ? err.message : err}.`;
            exit_code = 1;
        }
        logger.error(`[Twitter] Failed to authenticate with Twitter: ${error_string}`);
        return process.exit(exit_code);
    });
};
const initTwitterCredentials = () => _setAccessToken().then((res) => {
    if (!res) return;
    return _verifyCredentials();
});

const _formatContent = (content) => {
    try {
        let formatted_content = content;
        formatted_content = truncateText(formatted_content.trim());
        return formatted_content;
    } catch (e) {
        // If something bad happens, return immediately and let Twitter handle the text
        logger.warn(`[Twitter] Unable to format text: ${e}.`);
        return content;
    }
};
const _postTweet = (content) => initTwitterCredentials().then(() => statusesUpdateLimiter.schedule(() => twitterClient.post("statuses/update", {
    status: _formatContent(content),
}))).then((res) => {
    logger.info(`[Twitter] Successfully posted tweet [ https://twitter.com/i/web/status/${res.id_str} ].`);
    return true;
}).catch((err) => {
    let error_string;
    if (err.errors && err.errors.length) {
        error_string = err.errors.map((error) => `${error.message} [Code ${error.code}]`).join(" ");
    } else {
        error_string = `${err.message ? err.message : err}.`;
    }
    logger.error(`[Twitter] Failed to post a tweet: ${error_string}`);
});
const tweetHandler = (message) => {
    if (message.guild.id !== config.discordSettings.server_id) return;
    if (message.channel.id !== config.discordSettings.channel_id) return;
    if (!config.discordSettings.user_ids.includes(message.author.id)) return;

    logger.info(`[Twitter] Processing a message from ${message.author.tag} (${message.author.id}), in Server ${message.guild.name} (${message.guild.id}), Channel #${message.channel.name} (${message.channel.id}), `
        + `Message ID [ ${message.id} ].`);
    return _postTweet(message.cleanContent).then((tweet_posted) => {
        if (!tweet_posted) return;
        if (!config.discordSettings.react_on_success) return;
        if (!config.discordSettings.reaction_emoji || !config.discordSettings.reaction_emoji.length) {
            logger.warn("[Twitter] Unable to react to the original message: No reaction emoji set.");
            return;
        }
        return message.react(config.discordSettings.reaction_emoji).catch((err) => {
            logger.warn(`[Twitter] Unable to react to the original message: ${err.message ? err.message : err}.`);
        });
    });
};

const requestToken = () => twitterClient.getRequestToken("http://localhost").then((req_token) => {
    let output_string = "==============================================================\n";
    output_string += "=                DiscoTwit (by cycloptux#1543)               =\n";
    output_string += "=                  Authentication Workflow                   =\n";
    output_string += "==============================================================\n\n";
    output_string += "In order to post tweets on your behalf, DiscoTwit requires access to your Twitter account.\n";
    output_string += "Please open the following URL in your browser and authorize the app:\n\n";
    output_string += "==================================================================================\n";
    output_string += `${oauthUrl}${req_token.oauth_token}\n`;
    output_string += "==================================================================================\n\n";
    output_string += "You'll be redirected to an empty page. Check the URL in your browser, it will have this form:\n";
    output_string += "http://localhost/?oauth_token=RANDOM_CHARS&oauth_verifier=MORE_RANDOM_CHARS\n\n";
    output_string += "Set the \"oauth_token\" random string as an environment variable named \"TWITTER_OAUTH_TOKEN\".\n";
    output_string += "Set the \"oauth_verifier\" random string as an environment variable named \"TWITTER_OAUTH_VERIFIER\".\n";
    output_string += "You can do so by adding these lines to a file named \".env\" in the base root of this project:\n";
    output_string += "TWITTER_OAUTH_TOKEN=RANDOM_CHARS\n";
    output_string += "TWITTER_OAUTH_VERIFIER=MORE_RANDOM_CHARS\n";
    output_string += "(Be sure to replace the placeholder \"RANDOM_CHARS\" strings with the actual random chars you get from the browser URL)\n\n";
    output_string += "After you've done so, the bot will complete the authentication workflow on next startup and save the final authentication data locally.\n";
    // eslint-disable-next-line no-console
    console.log(output_string);
// eslint-disable-next-line no-console
}).catch(console.error);

module.exports = {
    initTwitterCredentials,
    tweetHandler,
    requestToken,
};
