require('dotenv').config();
const fetch = require('node-fetch')
const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js')
const chalk = require('chalk')
const setupSchema = require('../mongooseSchema/Setup.js')

//sleeper function to slow down requests
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function dataParser(account_id, requestOptions, screen_name, channel, baseline, guildId) {

    var count = 1
    var nextToken = 0;
    var pagTokenVal = ""
    var follower_array = []
    var data = []
    var tempData

    let url = "https://api.twitter.com/2/users/" + account_id + "/followers?max_results=1000"

    //get list of Twitter followers for account_id
    console.log(chalk.blue("Getting list of followers for " + chalk.blue.bold(account_id) + "...\n"))
    //paginate through calls if there is more than 1000 followers
    //This request returns max of 1000 followers (per Twitter API) and a pagination token. Using that token we can get the next 1000, etc
    do {
        console.log(chalk.blue("Beginning run " + chalk.blue.bold(count)))
        //sleep for 5 seconds to avoid limiting twitter API calls
        await sleep(5000)

        await fetch(url + pagTokenVal, requestOptions)
            .then(response => response.json())
            .then(result => {
                tempData = result
                if (tempData.meta.next_token) {
                    nextToken = tempData.meta.next_token
                    pagTokenVal = ("&pagination_token=" + nextToken)
                } else {
                    nextToken = undefined
                }
            })
            .catch(error => console.log(chalk.red('error, (all) followers unable to be retrieved (Most likely too many requests)', error)));

        console.log(chalk.blue("Ending run " + chalk.blue.bold(count) + "\n"))
        //sleep for another 5 seconds to avoid limiting twitter API calls
        await sleep(5000)

        data = data.concat(tempData.data)

        console.log(chalk.green("next_token value: " + chalk.underline.green(nextToken) + "\n"))

        count++
    } while (nextToken !== undefined && nextToken !== 0)

    var numFollowers = data.length
    //add followers to an array
    for (var i = 0; i < numFollowers; i++) {
        follower_array.push(data[i].username)
    }

    // var lostFollowers = ""
    var gainedFollowers = ""

    //building a button link to the twitter user's account
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('@' + screen_name)
                .setURL("https://twitter.com/" + screen_name)
                .setStyle(ButtonStyle.Link),
        );


    //compare baseline to current array to find lost followers
    // console.log(chalk.blue("Finding lost followers...\n"))

    // var difference = baseline.filter(x => follower_array.indexOf(x) === -1);
    // if (difference.length === 0) {
    //     console.log(chalk.green("No lost followers"))
    // } else {
    //     console.log("Lost followers: " + difference)
    //     //split string of difference at commas
    //     var split_out = ""
    //     split_out += difference
    //     split_out = split_out.split(',')
    //     for (var i = 0; i < split_out.length; i++) {
    //         lostFollowers += "@" + split_out[i] + "\n"
    //     }
    // }

    //Compare baseline to current array to find new followers
    console.log(chalk.blue("Finding new followers...\n"))

    var difference2 = follower_array.filter(x => baseline.indexOf(x) === -1);

    const embedHeader = new EmbedBuilder()
    var numNewFollowers = difference2.length

    embedHeader.setTitle("@" + screen_name)
        .setColor(0x7289DA)
        .addFields(
            { name: "Total Followers", value: "" + numFollowers },
            { name: "Total New Followers", value: '' + numNewFollowers },
        )

    try {
        // channel.send(outStr)
        channel.send({ embeds: [embedHeader] })
    } catch (error) {
        console.log(chalk.red(error))
    }

    if (difference2.length === 0) {
        console.log(chalk.green("No new followers"))
        channel.send({ components: [row] })
    } else if (numNewFollowers <= 35) {
        console.log(chalk.green("Gained followers: " + chalk.green.bold(difference2)))
        //split string of difference at commas
        var split_out = ""
        split_out += difference2
        split_out = split_out.split(',')
        for (var i = 0; i < split_out.length; i++) {
            gainedFollowers += "`@" + split_out[i] + "`\n"
        }
        const embed = new EmbedBuilder()
            .setColor(0x7289DA)
            .addFields(
                { name: "Gained followers", value: gainedFollowers, inline: true },
            )
        try {
            channel.send({ embeds: [embed], components: [row] })
        } catch (error) {
            console.log(chalk.red(error))
        }
    } else {
        console.log(chalk.green("Gained followers: " + chalk.green.bold(difference2)))
        //split string of difference at commas
        var split_out = ""
        split_out += difference2
        split_out = split_out.split(',')
        for (var i = 0; i < split_out.length; i++) {
            gainedFollowers += "\@" + split_out[i] + "\n"
            if (i !== 0 && i % 35 === 0) {
                const embedFor35 = new EmbedBuilder()
                    .setColor(0x7289DA)
                    .addFields(
                        { name: "Gained followers", value: gainedFollowers, inline: true },
                    )

                try {
                    channel.send({ embeds: [embedFor35] })
                } catch (error) {
                    console.log(chalk.red(error))
                }
                gainedFollowers = ""
                await sleep(3000)
            }
        }
        const embed = new EmbedBuilder()
            .setColor(0x7289DA)
            .addFields(
                { name: "Gained followers", value: gainedFollowers, inline: true },
            )

        try {
            channel.send({ embeds: [embed], components: [row] })
        } catch (error) {
            console.log(chalk.red(error))
        }
    }

    //update Mongoose database with the new follower array
    updateSchema(guildId, follower_array, screen_name)

}

//updates mongoDB database
async function updateSchema(guildId, update, screen_name) {
    let result = await setupSchema.updateOne(
        { Guild: guildId, UserName: screen_name },
        {
            $set: { Baseline: update }
        })
    console.log(result)
}

module.exports = { dataParser }