const { HearManager } = require('@vk-io/hear')
const bot = new HearManager()
const { Keyboard } = require('vk-io');
const userModel = require('./models/user')
const { initialMongoConnection } = require('./utils/mongoose');
const { vkGroup } = require('./utils/vk');
const {
    stepNo,
    stepStart,
    stepStop,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    taskFive,
    middlewareBotActive
} = require('./service/vkGameService');

initialMongoConnection();

vkGroup.updates.on('message_new', bot.middleware)

bot.hear(/привет/i, async msg => {
    await middlewareBotActive(stepStart, msg)
})

bot.hear(/^да$/i, async msg => {
    await middlewareBotActive(taskOne, msg)
})

bot.hear(/^продолжить$/i, async msg => {
    const user = await userModel.findOne({ userId: msg.senderId }).lean();
    if (!user) {
        return msg.send({ message: 'Сохраненная игра не найдена' })
    }
    const listSteps = {
        stepStart,
        taskOne,
        taskTwo,
        taskThree,
        taskFour,
        taskFive
    }
    let lastStatusTrue;
    for (const key in user.step) {
        const status = user.step[key];
        if (status) lastStatusTrue = key
        else {
            if (lastStatusTrue in listSteps) {

                const textParam = `step.${lastStatusTrue}`;

                await userModel.findOneAndUpdate({ userId: msg.senderId }, { 'step.stepStop': false, [textParam]: false })
                await middlewareBotActive(listSteps[lastStatusTrue], msg)
                break
            }
        }
    }
})


bot.hear(/^нет$/i, async msg => {
    await middlewareBotActive(stepNo, msg)
})

bot.hear(/^остановить$/i, async msg => {
    await middlewareBotActive(stepStop, msg)
})

bot.hear(/^готово$/i, async msg => {
    await middlewareBotActive(taskTwo, msg)
})

bot.hear(/^радуга$|^кактус$|^спиролло$/i, msg => {
    msg.send('Попробуй еще раз!')
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
    msg.send({ message: 'Подсказка - у него есть рог!', keyboard: keyboard })
})

bot.hear(/^единорожка$/i, async msg => {
    await middlewareBotActive(taskThree, msg)
})

bot.hear(/^сделано$/i, async msg => {
    await middlewareBotActive(taskFour, msg)
})

bot.hear(/^медовое с лимоном и имбирем$|^медовое с имбирем и лимоном$|^медовое$|^с имбирем и лимоном$/i, async msg => {
    await middlewareBotActive(taskFive, msg)
})

console.log('Bot Started')
vkGroup.updates.start().catch(console.error)