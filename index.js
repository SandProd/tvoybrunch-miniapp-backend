const HTTP = require('http');
const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');

const token = '6835736852:AAGJL4zqg5Qd8aE7Di2zaXm5ccuZE9RNa5Y';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const PORT = '3000';
const HOSTNAME = '127.1.1.141'; 

const bot = new TelegramBot(token, {polling: true});
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    console.log('Server started')
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму ', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            // console.log(data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
            await bot.sendMessage(chatId, 'Ваш номер дома: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } 
    catch (e) {
        input_message_content: {
            message_text: ` Не удалось произвести покупку, вы пытались приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
        }
        return res.status(500).json({})
    }
})

app.listen(
    PORT, () => console.log('server started on PORT ' + PORT),
    HOSTNAME, () => console.log('server started on HOSTNAME ' + HOSTNAME))  