const { model, Schema }  = require('mongoose')

const setupSchema = new Schema({
    Guild: String,
    Channel: String,
    UserName: String,
    Baseline: Array
})

module.exports = model('channel-ids-indev', setupSchema, 'channel-ids-indev')