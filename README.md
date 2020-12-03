# DiscoTwit Discord Bot

## About

DiscoTwit is an open source, customizable [Discord](https://discord.com/)-to-[Twitter](https://twitter.com/) integration bot whose goal is to tweet messages posted on Discord. DiscoTwit is built in Node.js using [discord.js](https://discord.js.org/).

DiscoTwit is provided as **source code** to be **self-hosted**. It requires a both a [Discord App](https://discord.com/developers/docs/intro) and a [Twitter App](https://developer.twitter.com/) to work.

## Prerequisites

**Node.js 12.0.0 or newer is required.**

You will also need:

- A Discord Bot token ([Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot))
- A Twitter Developer Account & App ([Guide](https://medium.com/@divyeshardeshana/create-twitter-developer-account-app-4ac55e945bf4))

## Installing

DiscoTwit runs from its source code. In order to install DiscoTwit, you must run the following commands:

```
git clone https://github.com/cycloptux/DiscoTwit.git
cd DiscoTwit
npm ci --only=production
```

After you've done so, you can run `node index.js` or `npm start` to start the bot.

⚠️ DiscoTwit will not start unless you set its mandatory settings! Check the "Configuration" and "First Startup" paragraphs first.

## Configuration

All configurations are applied through environment variables. DiscoTwit will load variables from a `.env` file placed into the root of the project.

Here's a list of all available configuration parameters:

- `BOT_NAME`: Sets a name for the bot user in Discord. Optional, defaults to DiscoTwit.
- `BOT_TOKEN`: The Discord bot token you get from the developer portal. **Mandatory**.
- `BOT_PREFIX`: The prefix for the DiscoTwit command(s). Optional, defaults to `dt@`.
- `BOT_ACTIVITY`: Sets a "Playing" activity for the bot. Optional, defaults to none.

- `SERVER_ID`: Server ID of the server where DiscoTwit will look for messages to tweet. Mandatory.
- `CHANNEL_ID`: Channel ID of the channel where DiscoTwit will look for messages to tweet. Mandatory.
- `USER_IDS`: Comma-separated list of user IDs whose messages (sent in the configured channel) will be tweeted. Mandatory.

- `REACT_ON_SUCCESS`: Boolean value (`true` or `false`) to configure whether DiscoTwit will react to the original Discord message upon a successful tweet. Optional, defaults to `true`.
- `REACTION_EMOJI`: [Unicode emoji](https://unicode.org/emoji/charts/full-emoji-list.html) to be used as a reaction for the above feature. Optional, defaults to ✅.

- `TWITTER_CONSUMER_KEY`: Consumer API key for the Twitter App you created. **Mandatory**, check the "First Startup" paragraph.
- `TWITTER_CONSUMER_SECRET`: Consumer API key secret for the Twitter App you created. **Mandatory**, check the "First Startup" paragraph.
- `TWITTER_OAUTH_TOKEN` OAuth token obtained through the initial Twitter authorization phase. Optional, check the "First Startup" paragraph.
- `TWITTER_OAUTH_VERIFIER` OAuth verifier token obtained through the initial Twitter authorization phase. Optional, check the "First Startup" paragraph.
- `TWITTER_ACCESS_TOKEN_KEY` OAuth access token key obtained through the Twitter Developer Portal. Optional, check the "First Startup" paragraph.
- `TWITTER_ACCESS_TOKEN_SECRET` OAuth access token secret obtained through the Twitter Developer Portal. Optional, check the "First Startup" paragraph.

- `LOG_LEVEL`: Minimum [logging level](https://github.com/winstonjs/winston#logging-levels). Optional, defaults to `info`.
- `LOG_CONSOLE_COLORIZE`: Boolean value (`true` or `false`) to configure whether the console logging will show a colorized version of the log level for each message. Optional, defaults to `true`.
- `LOG_LOCAL_ENABLED`: Boolean value (`true` or `false`) to configure whether the logs will also be saved to local `.log` files. Optional, defaults to `false`.
- `LOG_LOCAL_RETENTION`: Number of days after which the (automatically rotated) local log files, if enabled, will be deleted. Optional, defaults to `7`.
- `LOG_LOCAL_JSON`: Boolean value (`true` or `false`) to configure whether the local log files, if enabled, will be saved into JSON format. Optional, defaults to `true`.

If you use the `.env` file approach, each parameter can be set as:

```
PARAMETER_NAME=value
```

## First Startup

In order for the Twitter functionality to work, you must create a Twitter App and pass the API keys to the bot.

The "Consumer Keys" are mandatory and required for the Twitter-facing part of the bot to be recognized by Twitter as an "App". Apps are just technical accounts though: you can't "post tweets" as an app.

You must log into the app you created as a Twitter used to be able to post a tweet. In order to do so, you need to trigger the OAuth workflow and log into the app as the user on behalf of whom DiscoTwit will post on Twitter.

**As of December 1st, 2020, Twitter revamped the Developer Portal**. Here are the steps required to obtain the required tokens:

1. Head to the [Twitter Developer](https://developer.twitter.com/) home page, sign into your account (you'll need to apply for a developer account if you haven't already).
2. Enter the [Developer Portal](https://developer.twitter.com/en/portal/dashboard) dashboard.
3. Under "Project & Apps", click on "Overview", then under "Standalone Apps" click on ["Create App"](https://developer.twitter.com/en/portal/apps/new).
4. Name your app: the app name must be unique within the whole Twitter ecosystem. Then click "Complete".
5. You'll be shown 3 tokens now: "API key" is our `TWITTER_CONSUMER_KEY`, "API secret key" is our `TWITTER_CONSUMER_SECRET`. Write those down since they won't be shown again! Ignore the "Bearer token", we don't need that one.
6. Click on "App settings".
7. We need our app to be able to send tweets: under "App permissions" click "Edit", flag "Read and Write", then click "Save" and confirm with a "Yes".

Set the `TWITTER_CONSUMER_KEY` and `TWITTER_CONSUMER_SECRET` environment variables accordingly.

At this point we need to create the OAuth authentication tokens. We have two possible options here:

1. The account we're using to create the app is the one we're going to use to post to Twitter through DiscoTwit.
2. We want to use a different account for the tweets.

### Option 1

1. Scroll to the top of the page and click on the "Keys and tokens" tab.
2. Under "Authentication Tokens", you'll find a "Access token & secret" option: click on "Generate".
3. You'll be shown 2 tokens now: "Access token" is our `TWITTER_ACCESS_TOKEN_KEY`, "Access token secret" is our `TWITTER_ACCESS_TOKEN_SECRET`. Write those down since they won't be shown again!

Set the `TWITTER_ACCESS_TOKEN_KEY` and `TWITTER_ACCESS_TOKEN_SECRET` environment variables accordingly.

We're done! Check the rest of the mandatory configuration parameters and start DiscoTwit.

### Option 2

1. Under "Authentication settings" click "Edit".
2. Hit the toggle to "Enable 3-legged OAuth". Keep "Request email address from users" disabled.
3. Under "Callback URLs (required)" put this string: `http://localhost`
4. Under "Website URL (required)" put: `https://github.com/cycloptux/DiscoTwit`
5. Click on "Save".
6. From the root of the DiscoTwit project, run `npm run auth` and follow the instructions shown in your console.
7. After correctly setting the `TWITTER_OAUTH_TOKEN` and `TWITTER_OAUTH_VERIFIER` environment variables, start the bot with `npm start`.
8. DiscoTwit will log into the Twitter user account and save the authentication data locally into the `./config/twitter_credentials.json` file.

⚠️ **Keep the `twitter_credentials.json` file (and the `.env` file, if you're using that) safe!** They contain your Discord bot and Twitter app/user tokens!

Anyone that gets access to your token may potentially get access to your Twitter account and control your Discord bot.

Both files are already added to `.gitignore`, but still double check that they are not committed to a public repository!

## Usage

DiscoTwit is very simple to use. As long as you correctly set the `SERVER_ID`, `CHANNEL_ID` and `USER_IDS` parameters, DiscoTwit will attempt posting all messages sent by the authorized user(s) the server/channel you configured.

Messages are automatically truncated to fit the 280 characters limit imposed by Twitter.

Twitter imposes a [rate limit](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update) on the number of tweets a user can post in a specific amount of time. The current (December, 2020) limit is set to 300 tweets in 3 hours, which averages to 1 tweet per ~36 seconds.

DiscoTwit has an internal rate limiter that will queue each message to be posted at the appropriate pace. Please note that the queue length might become an issue if you post too many messages in the configured channel! Please behave yourself.

DiscoTwit only has one command, `dt@help`, which shows basic info about the bot and how it's configured.

## FAQ

**Q: I'm getting errors when DiscoTwit attempts connecting to Twitter!**

**A:** Your tokens might be expired or revoked. Try running the authentication steps again.

**Q: DiscoTwit is so slow at posting my messages!**

**A:** The bot has an internal rate limiter to ensure that the pace at which tweets are posted does not exceed the imposed [rate limits](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update).

**Q: Server ID? Channel ID? What are these IDs you are talking about?**

**A:** Check [this guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).

## Contributing

1. [Fork the repository](https://github.com/cycloptux/DiscoTwit/fork)
2. Clone your fork: `git clone https://github.com/your-username/DiscoTwit.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am "Add some feature"`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request

## Versioning

We use [SemVer](http://semver.org/) for versioning. Check [CHANGELOG.md](CHANGELOG.md) for the full changelog.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
