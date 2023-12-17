const http = require('http');
const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const PORT = 3000;
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

            // Сохраняем данные о доставке и заказе в базе данных
            saveUserDataToDB(Username, data, msg.body.products, msg.body.totalPrice);

            // Отправка сообщений в Телеграм
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваш номер дома: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
            await bot.sendMessage(chatId, 'Ваш район:' + data?.district);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Вся информация будет отправлена в этот чат');
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});

// Database connection
const connection = mysql.createConnection({
    host: 'tvoybruc.mysql.tools',
    user: 'tvoybruc_db',
    password: 'wjtMG2Wc',
    database: 'tvoybruc_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

// Функция для сохранения данных о доставке и заказе в базе данных MySQL
function saveUserDataToDB(username, data, products, totalPrice) {
    const { country, street, district } = data;
    const userOrder = products.map(item => item.title).join(', ');

    const sql = `
        INSERT INTO Orders (username, userorder, TotalPrice, country, street, district)
        VALUES ('${username}', '${userOrder}', ${totalPrice}, '${country}', '${street}', '${district}')
    `;

    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("User data and order data inserted into the database");
    });
}

// Server route
app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    try {
        // Отправка данных о заказе в базу данных
        saveUserDataToDB(Username, req.body.data, products, totalPrice);

        // Отправка сообщений в Телеграм
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

// Server listening
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
