const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userId: {
            type: String,
            unique: true
        },
        step: {
            stepStart: {
                type: Boolean,
                default: false
            },
            taskOne: {
                type: Boolean,
                default: false
            },
            taskTwo: {
                type: Boolean,
                default: false
            },
            taskThree: {
                type: Boolean,
                default: false
            },
            taskFour: {
                type: Boolean,
                default: false
            },
            taskFive: {
                type: Boolean,
                default: false
            },
            stepFinish: {
                type: Boolean,
                default: false
            },
            stepNo: {
                type: Boolean,
                default: false
            },
            stepStop: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('user', schema);