const {
    msgWelcome,
    msgStepOne,
    msgNoSubscribeToGroup,
    msgStepTwo,
    msgNoLikes,
    msgStepTwoSuccefull,
    msgStepThree,
    msgStepThreeSuccefull,
    msgStepFour,
    msgStepFourSuccefull,
    msgStepNo,
    msgStepStop,
    msgStepContinue,
} = require('../variables/variables');

const { vkDev, upload } = require('../utils/vk');
const userModel = require('../models/user')
const settingModel = require('../models/setting')
const { Keyboard } = require('vk-io');

async function stepStart({ msg }) {

    const user = await userModel.findOne({ userId: msg.senderId });
    if (user) {
        if (user.step.stepStart) return msg.send(msgStepContinue);;
    } else {
        await userModel.create({ userId: msg.senderId });
    }

    const attachment = await upload.messagePhoto({
        source: {
            value: './img/dlya-bota.png'
        }
    });
    let keyboard = Keyboard
        .keyboard([[
            Keyboard.textButton({
                label: 'Да',
                color: 'positive'
            }),
            Keyboard.textButton({
                label: 'Нет',
                color: 'negative'
            }),
            Keyboard.textButton({
                label: 'Остановить',
                color: 'primary'
            })
        ]])
        .inline();
    msg.send({ message: msgWelcome, keyboard, attachment })

    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.stepStart": true })
}
async function taskOne({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.taskOne) return;

    let keyboard = Keyboard
        .keyboard([[
            Keyboard.textButton({
                label: 'Готово',
                color: 'positive'
            }),
            Keyboard.textButton({
                label: 'Остановить',
                color: 'primary'
            })
        ]])
        .inline();
    msg.send({ message: msgStepOne, keyboard: keyboard });

    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.taskOne": true, "step.stepNo": true });
}
async function taskTwo({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.taskTwo) return

    const groupMembers = await vkDev.api.call('groups.getMembers', {
        group_id: process.env.GROUP_ID
    })
    if (msg.senderId != groupMembers.items.find(item => item == msg.senderId)) {
        let keyboard = Keyboard
            .keyboard([[
                Keyboard.textButton({
                    label: 'Готово',
                    color: 'positive'
                }),
                Keyboard.textButton({
                    label: 'Остановить',
                    color: 'primary'
                })
            ]])
            .inline();
        return msg.send({ message: msgNoSubscribeToGroup, keyboard: keyboard })
    }

    const lastPost = await vkDev.api.call('wall.get', {
        owner_id: `-${process.env.GROUP_ID}`,
        count: '5',
        extended: 1
    })

    let countLikesPost = 0;
    for (let i = 0; i < 5; i++) {
        const idPosts = lastPost.items[i].id;
        const countLikes = lastPost.items[i].likes.count
        let offsets = Math.ceil(countLikes / 1000);
        for (let n = 0; n < offsets; n++) {
            const likesLastPosts = await vkDev.api.call('likes.getList', {
                type: "post",
                owner_id: `-${process.env.GROUP_ID}`,
                item_id: idPosts,
                count: 1000,
                offset: n * 1000
            })
            if (msg.senderId == likesLastPosts.items.find(item => item == msg.senderId)) {
                countLikesPost++
                break
            }
        }
    }

    if (countLikesPost == 5) {
        let keyboard = Keyboard
            .keyboard([[
                Keyboard.textButton({
                    label: 'Радуга',
                    color: 'positive'
                }),
                Keyboard.textButton({
                    label: 'Единорожка',
                    color: 'positive'
                })],
            [Keyboard.textButton({
                label: 'Кактус',
                color: 'positive'
            }),
            Keyboard.textButton({
                label: 'Спиролло',
                color: 'positive'
            })],
            [Keyboard.textButton({
                label: 'Остановить',
                color: 'primary'
            })
            ]])
            .inline();
        msg.send({ message: msgStepTwo, keyboard: keyboard })
    } else {
        let keyboard = Keyboard
            .keyboard([[
                Keyboard.textButton({
                    label: 'Готово',
                    color: 'positive'
                }),
                Keyboard.textButton({
                    label: 'Остановить',
                    color: 'primary'
                })
            ]])
            .inline();
        return msg.send({ message: msgNoLikes, keyboard: keyboard })
    }

    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.taskTwo": true })
}
async function taskThree({ msg }) {

    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.taskThree) return

    const attachment = await upload.messagePhoto({
        source: {
            value: './img/edinorozhka-bot.jpg'
        }
    });
    msg.send({ message: msgStepTwoSuccefull, attachment })
    let keyboard = Keyboard
        .keyboard([[
            Keyboard.textButton({
                label: 'Сделано',
                color: 'positive'
            }),
            Keyboard.textButton({
                label: 'Остановить',
                color: 'primary'
            })
        ]])
        .inline();
    msg.send({ message: msgStepThree, keyboard: keyboard })
    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.taskThree": true })
}
async function taskFour({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.taskFour) return

    msg.send(msgStepThreeSuccefull);
    msg.send(msgStepFour)
    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.taskFour": true })
}
async function taskFive({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.taskFive) return

    let keyboard = Keyboard
        .keyboard([
            [Keyboard.textButton({
                label: 'Все отлично',
                color: 'primary'
            }),
            Keyboard.textButton({
                label: 'Сложные задания',
                color: 'primary'
            })],
            [Keyboard.textButton({
                label: 'Расстроил приз',
                color: 'primary'
            }),
            Keyboard.textButton({
                label: 'Жду новых заданий',
                color: 'primary'
            })]
        ])
        .inline();
    msg.send({ message: msgStepFourSuccefull, keyboard: keyboard })
    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.taskFive": true })
}
async function stepNo({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.stepNo) return

    msg.send(msgStepNo)

    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.stepNo": true })
}

async function stepStop({ msg }) {
    const checkMessage = await userModel.findOne({ userId: msg.senderId })
    if (checkMessage.step.stepStop) return

    msg.send(msgStepStop);

    await userModel.findOneAndUpdate({ userId: msg.senderId }, { "step.stepStop": true })
}

async function middlewareBotActive(callback, msg) {
    const setting = await settingModel.findOne({ nameSetting: 'botActive' })
    if (setting) {
        if (setting.botActive) return await callback({ msg });
        return
    }
    else {
        await settingModel.create({ nameSetting: 'botActive', botActive: true })
    }
    await callback({ msg })
}

module.exports = {
    stepNo,
    stepStart,
    stepStop,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    taskFive,
    middlewareBotActive
}