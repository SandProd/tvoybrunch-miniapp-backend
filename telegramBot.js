const TelegramBot = require("node-telegram-bot-api");
const db = require("./db");

const token = '6835736852:AAGJL4zqg5Qd8aE7Di2zaXm5ccuZE9RNa5Y';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const bot = new TelegramBot(token, { polling: true });
    // TODO: Chat is privet?
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

            // Combine country, street, and district into a single address
            const addressValue = `${data?.country}, ${data?.street}, ${data?.district}`;

            // Save or update user information in the Users table
            const query = `
                INSERT INTO Users (address, username)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE
                address = VALUES(address), username = VALUES(username);
            `;

            const values = [addressValue, data?.username];

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error saving user information to the database: ' + err.stack);
                    return;
                }
                console.log('User information saved to the database');
            });

            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваш адрес: ' + addressValue);
            await bot.sendMessage(chatId, 'Ваш юзернейм: ' + data?.username);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Вся информация будет отправлена в этот чат');
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});

module.exports = { bot };
