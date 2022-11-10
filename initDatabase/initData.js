const fetch = require('node-fetch')
require('dotenv').config();
const chalk = require('chalk')

//sleeper function to slow down requests
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function initData(account_id, requestOptions, numFollowers, screen_name, channel) {

    var count = 1
    var nextToken = 0;
    var pagTokenVal = ""
    var follower_array = []
    var data = []
    var tempData;

    let url = "https://api.twitter.com/2/users/" + account_id + "/followers?max_results=1000"

    console.log(chalk.blue("Getting list of followers for " + chalk.blue.bold(account_id) + "...\n"))

    do {
        console.log(chalk.blue("Beginning run " + chalk.blue.bold(count)))
        //sleep for 5 seconds
        await sleep(5000)

        const res = await fetch(url + pagTokenVal, requestOptions)
            .then(response => response.json())
            .then(result => {
                tempData = result
                if (tempData.meta.next_token) {
                    nextToken = tempData.meta.next_token
                    pagTokenVal = ("&pagination_token=" + nextToken)
                } else {
                    nextToken = undefined
                }
                //uncomment next line when testing for dev purposes
                console.log(tempData.data)
            })
            .catch(error => console.log(chalk.red('error, (all) followers unable to be retrieved (Most likely too many requests)', error)));

        console.log(chalk.blue("Ending run " + chalk.blue.bold(count) + "\n"))

        await sleep(5000)

        data = data.concat(tempData.data)

        console.log(chalk.green("next_token value: " + chalk.underline.green(nextToken) + "\n"))

        count++
    } while (nextToken !== undefined && nextToken !== 0)

    //add followers to an array
    for (var i = 0; i < numFollowers; i++) {
        follower_array.push(data[i].username)
    }
    return follower_array

}

module.exports = { initData }