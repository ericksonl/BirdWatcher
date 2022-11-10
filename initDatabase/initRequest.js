const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
require('dotenv').config();
const { initData } = require('./initData.js')
const chalk = require('chalk')

async function initRequest(channel, screen_name) {

    var data;
    //grab account ID from screen_name
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

    //get ID and num followers
    const res = await fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => {
            data = result
            accountId = data.data.id
            numFollowers = data.data.public_metrics.followers_count
            console.log(chalk.green("Id and num followers successfully retrieved!\n"))
        })
        .catch(error => {
            console.log(chalk.red('error, ID unable to be retrieved\n', error))
        });

    //if follower count is over 15k, itll take more more than 15 minutes to compile, so we dont let that happen
    if (numFollowers < 10000) {
        return await initData(accountId, requestOptions, numFollowers, screen_name, channel)
    } else if (numFollowers >= 10000) {
        return -1
    } else {
        return -2
    }
}

module.exports = { initRequest };

// MAY BE USED LATER

