require('dotenv').config();

const { REST } = require('@discordjs/rest'),
    { Routes } = require('discord-api-types/v10'),
    { Client, Intents, Collection, Guild } = require('discord.js'),
    { requestData } = require('./functions/requestData.js')

const fs = require('fs'),
    path = require('path'),
    cron = require('node-cron'),
    mongoose = require('mongoose'),
    setupSchema = require('./mongooseSchema/Setup.js'),
    chalk = require('chalk')

//allow bot to have access to guild and send messages
const client = new Client({
    intents: ['Guilds', 'GuildMessages']
});

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//load all commands
const commands = [] //a list of all commands in commands folder
client.commands = new Collection() //collection of all command names with command functions

const commandsPath = path.join(__dirname, "commands"); //holds path to commands 
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

//when bot comes online:
client.on("ready", async () => {

    //connect to mongoDB database
    console.log(chalk.blue("Connecting to MongoDB database...\n"))
    await mongoose.connect(process.env.DATABASE_TOKEN || '', {
        keepAlive: true
    }).then(console.log(chalk.green("Connected to database")))

    // Get all ids of the servers
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    //update commands for guilds
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log(chalk.green('Successfully updated commands for guild ' + guildId)))
            .catch(console.error);
    }

    //Cron values: * * * * *
    //In: minute, hour, day, month, day of the week 
    // var cron_value = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,0 * * * *'
    var cron_value = '0 6,10,14 * * *'

    var task = cron.schedule(cron_value, async () => {
        //execute this code for every guild that has run /set-up
        console.log("Beginning scheduled task..")
        console.log("--------------------------------------------------------------------------")
        for (var j = 0; j < guild_ids.length; j++) {
            const guildId = guild_ids[j]
            //find database via guildId
            
            setupSchema.find({ Guild: guildId }, async (err, data) => {
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        var userIn = data[i].UserName
                        setupSchema.findOne({ Guild: guildId, UserName: userIn }, async (err, data) => {
                            if (!data) {
                                console.log("No user data for Guild: " + guildId)
                                return
                            }
                            var guildIn = client.guilds.cache.get(guildId);
                            let Channel = data.Channel
                            let UserName = data.UserName
                            let Baseline = data.Baseline

                            //set output channel
                            const outChannel = guildIn.channels.cache.get(Channel)

                            console.log(chalk.blue("Begining request...\n"))
                            //request follower data
                            await requestData(outChannel, UserName, Baseline, guildId)
                        })
                    }
                } else {
                    console.log("No data found for guild:" + guildId)
                }
            })
            await sleep(5000)
        }
    })

    console.log(chalk.blue("Validating cron...\n"))
    //validate cron value just in case they change their shit or mine doesnt work
    if (cron.validate(cron_value) === true) {
        console.log(chalk.green("Cron validated. \nString " + cron_value + " registered as current cron value"))
        task.start()
    } else {
        console.log(chalk.red("Cron invalid. \nString " + cron_value + " does not appear to be a valid cron value"))
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    //try to execute the command    
    try {
        await command.execute(interaction);
    }
    //if it doesnt work, log it and reply to the user there was an error
    catch (error) {
        console.error(error);
        try {
            await interaction.reply({ content: "There was an error when trying to execute this command" });
        } catch (e) {
            console.log(e)
            await interaction.followUp({ content: "There was an error when trying to execute this command" });
        }
    }
});

client.on('guildCreate', guild => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    //update commands for guilds
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Successfully updated commands for guild ' + guildId))
            .catch(console.error);
    }
});



process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

client.login(process.env.DISCORD_TOKEN);