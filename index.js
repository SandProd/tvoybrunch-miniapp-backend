const http = require('http');
const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');
const db = require('./db');
const productsRouter = require('./routes/products');

const token = '6835736852:AAGJL4zqg5Qd8aE7Di2zaXm5ccuZE9RNa5Y';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const PORT = '3000';
const HOSTNAME = '127.1.1.141';

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

let Username;

// Bot event handling
bot.on('message', (message) => {
    const username = message.chat.first_name;
    console.log(`User ${username} is interacting with the bot.`);
    Username = username;
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму ', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Адресс доставки', web_app: { url: `${webAppUrl}/form` } }]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🍱 Меню', web_app: { url: webAppUrl } }],
                    [{ text: '🎟️ Акции', web_app: { url: `${webAppUrl}/discounts` } }],
                    [{ text: '👤 Профиль', web_app: { url: `${webAppUrl}/profile` } }],
                    [{ text: '📱 Контакты', web_app: { url: `${webAppUrl}/contacts` } }]
                ]
            }
        });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data);
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваш номер дома: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
            await bot.sendMessage(chatId, 'Bаш район:' + data?.district);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

// Подключение маршрутов из файла products.js
app.use('/products', productsRouter);

// Server route
app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    try {
        const sql = `INSERT INTO Orders (username, userorder, TotalPrice) VALUES ('${Username}', '${products.map(item => item.title).join(', ')}', ${totalPrice})`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            console.log("1 record inserted");
        });

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice} BYN, ${products.map(item => item.title).join(', ')}`
            }
        });

        return res.status(200).json({});
    } catch (e) {
        console.log(e);
        return res.status(500).json({});
    }
});

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
