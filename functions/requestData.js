require('dotenv').config();
const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
const { dataParser } = require('./dataParser.js')
const chalk = require('chalk')

async function requestData(channel, screen_name, baseline, guildId) {
    11
    var data;
    var accountId;
    var numFollowers;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + process.env.TWITTER_BEARER_TOKEN);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    url = 'https://api.twitter.com/2/users/by/username/' + screen_name + '?user.fields=public_metrics'

    console.log(chalk.blue("Getting ID and num followers for " + chalk.blue.bold(screen_name) + "...\n"))

    //get ID and num followers from screen_name
    try {
        await fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                data = result
                accountId = data.data.id
                numFollowers = data.data.public_metrics.followers_count
                console.log(chalk.green("Id and num followers successfully retrieved!\n"))
            })

        //if follower count is over 15k, itll take more more than 15 minutes to compile, so we dont let that happen (yet)
        if (numFollowers < 10000) {
            try {
                return await dataParser(accountId, requestOptions, numFollowers, screen_name, channel, baseline, guildId)
            } catch (e) {
                console.log(e)
                channel.send({ content: "You are being rate limited by twitter! Try again in 15 minutes!"})
                return
            }

        } else {
            channel.send("Sorry, " + screen_name + " has over 10,000 followers. Support for an account with 10,000+ followers is not currently supported.\n"
                + "To increase this limit, complain to Twitter about their rate limits until they increase it.\nPlease re-run setup.")
            return
        }
    } catch (e) {
        console.log(e)
        channel.send({ content: "Sorry, " + screen_name + " is not a registered twitter user." })
    }
}

module.exports = { requestData };
