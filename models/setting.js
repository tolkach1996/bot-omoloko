const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        nameSetting: {
            type: String,
        },
        botActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('setting', schema);