const TelegramBot = require("node-telegram-bot-api");
const db = require("./db");
const logger = require("./logger");

const token = '6835736852:AAGJL4zqg5Qd8aE7Di2zaXm5ccuZE9RNa5Y';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        try {
            await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму ', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Адрес доставки', web_app: { url: `${webAppUrl}/form` } }]
                    ]
                }
            });

            await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопкам ниже', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🍱 Меню', web_app: { url: webAppUrl } }],
                        [{ text: '🎟️ Акции', web_app: { url: `${webAppUrl}/discounts` } }],
                        [{ text: '👤 Профиль', web_app: { url: `${webAppUrl}/profile` } }],
                        [{ text: '📱 Контакты', web_app: { url: `${webAppUrl}/contacts` } }]
                    ]
                }
            });
        } catch (error) {
            logger.error('Error sending message:', error);
        }
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            logger.info(data);

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

            try {
                await dbQuery(query, values);
                logger.info('User information saved to the database');
            } catch (error) {
                logger.error('Error processing database query:', error);
                await bot.sendMessage(chatId, 'Извините, произошла ошибка при сохранении информации о пользователе.');
                return;
            }

            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваш адрес: ' + addressValue);
            await bot.sendMessage(chatId, 'Ваш юзернейм: ' + data?.username);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Вся информация будет отправлена в этот чат');
            }, 3000);
        } catch (error) {
            logger.error('Error processing message:', error);
        }
    }
});

module.exports = { bot };

async function dbQuery(query, values) {
    try {
        const [rows, fields] = await db.execute(query, values);
        return rows;
    } catch (err) {
        logger.error(`Ошибка выполнения запроса к базе данных: ${err}`);
        throw err;
    }
}
