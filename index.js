const TelegramBot = require('node-telegram-bot-api');

const token = '6835736852:AAGJL4zqg5Qd8aE7Di2zaXm5ccuZE9RNa5Y';
const webAppUrl = '/';
const bot = new TelegramBot(token, {polling:true});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Bottom button, fill form', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Make order', web_app: {webAppUrl}}]
                ]
            }
        })
    }

    bot.sendMessage(chatId, 'Received your message');
})