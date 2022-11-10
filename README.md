# BirdWatcher

BirdWatcher is a Discord bot that will track the new followers of a Twitter user. This bot is fully customizable, allowing you to track anyone with under 10,000 followers. Updates are sent out daily at 6am, 10am, and 2pm (your machine's local timezone).

## 📸 Screenshots
<img src="https://github.com/ericksonl/ericksonl/blob/main/assets/DailyUpdate.PNG">
<img src="https://github.com/ericksonl/ericksonl/blob/main/assets/Help.PNG">


## 📝 Commands

> Note: This bot uses Discord slash commands

| Command | Description | Arguments | Requirements | Usage(s) |
| --- | --- | --- | --- | --- |
| `/add` | Adds a user to be tracked! | `Channel` <br /> `Username` | - Must be a valid text channel <br /> - Must be a valid twitter username | `/add general elonmusk`
| `/remove` | Removes one of the users being tracked | `Username` | - Must be a user that is currently being tracked | `/remove elonmusk`
| `/tracked` | Displays all users currently being tracked | None | None | `/tracked`
| `/request` | Request an update for a tracked user | `Username` | - Must be a user that is currently being tracked | `/request elonmusk`
| `/help` | Displays all the commands of the bot. <br /> Providing the name of a command will return all available information about that command. | `Command` | None | `/help` <br /> `/help command`

## 🚀 Setup

Before running this on your local machine, you will need to do the following:

* Download and set up Node.js
* Create a new project in the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard). Save the `Bearer token`. A guide to do this can be found [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
* Create a new application in the [Discord Developer Portal](https://discord.com/developers/applications). Save the `Token` and `Client ID Token`. A guide to do this can be found [here](https://developer.twitter.com/en/docs/projects/overview#:~:text=To%20create%20a%20Project%2C%20click,%2C%20description%2C%20and%20use%20case.)
* Create a new project in [MongoDB](https://cloud.mongodb.com/). Save the `Connection String`. A guide to do this can be found [here](https://www.mongodb.com/docs/cloud-manager/tutorial/manage-projects/)

After you have the necessary requirements, run the following commands:

```sh
git clone https://github.com/ericksonl/BirdWatcher.git
cd BirdWatcher
npm install
```

After installation finishes, follow configuration instructions. Run `node .` to start the bot.

## ⚙️ Configuration
Create a .env file in the project root following this outline:

#### ⚠️ Never commit or share your token or api keys publicly ⚠️

```html
DISCORD_TOKEN=<Discord Token>
CLIENT_ID=<Discord Client ID>

TWITTER_BEARER_TOKEN=<Twitter Bearer token>

DATABASE_TOKEN=<MongoDB Connection String>
```

## 🕒 Changing the update times
Locate line 64 in `bot.js`. Change the cron_value to your desired update times. Cron values are written in the following format:

| * | * | * | * | * |
| --- | --- | --- | --- | --- |
| Minute | Hour | Day | Month | Day of the week

Examples: 
```js
cron_value = 5 * * * * //this will output every 5 minutes
cron_value = 0 5 * * * //this will output everyday at 5am
cron_value = 0 5 4 * * //this will output on the 4th of every month at 5am
cron_value = 0 5 4 5 * //this will output on the 4th of May at 5am
```

For additional help and info on cron values see their [official website](https://crontab.guru/)

## ❗ Important Info

* Twitter has a rate limit of 15 requests per 15 minutes, and will return a max of 1000 followers per each request. This means you will be unable to track a user who has more than 15,000 followers. As a safegaurd, I capped BirdWatcher at 10,000.
