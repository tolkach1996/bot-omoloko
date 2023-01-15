const { VK, Upload, API } = require('vk-io');
require('dotenv').config()

const vkDev = new VK({
    token: process.env.DEV_TOKEN
})
const vkGroup = new VK({
    token: process.env.GROUP_TOKEN
})
const api = new API({
    token: process.env.GROUP_TOKEN
})
const upload = new Upload({
    api
});

module.exports = {
    vkDev,
    vkGroup,
    upload
}