const HTTP = require('http');
const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');
const geolib = require('geolib');

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const webAppUrl = 'https://rococo-lily-4bd96e.netlify.app';

const PORT = '3000';
const HOSTNAME = '127.1.1.141';

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

async function getCoordinates(address) {
    try {
        const response = await new Promise((resolve, reject) => {
        // Замените YOUR_OPENCAGE_API_KEY на ваш ключ API от OpenCage
        const apiKey = 'YOUR_OPENCAGE_API_KEY';
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    HTTP.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            ata += chunk;
        });
        res.on('end', () => {
            resolve(JSON.parse(data));
        });
        }).on('error', (error) => {
            reject(error);
        });
    });

        const { geometry } = response.results[0];
    return { latitude: geometry.lat, longitude: geometry.lng };
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        throw error;
    }
}

async function calculateDistance(address1, address2) {
    try {
        const coordinates1 = await getCoordinates(address1);
        const coordinates2 = await getCoordinates(address2);

        const distance = geolib.getDistance(coordinates1, coordinates2);

        console.log(`Distance between ${address1} and ${address2}: ${distance} meters`);
        return distance;
    } catch (error) {
        console.error('Error calculating distance:', error.message);
        throw error;
    }
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму ', {
    reply_markup: {
        keyboard: [
            [{ text: 'Адресс доставки', web_app: { url: webAppUrl + '/form' } }]
        ]
    }
    });

    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
    reply_markup: {
        inline_keyboard: [
            [{ text: '🍱 Меню', web_app: { url: webAppUrl } }],
            [{ text: '🎟️ Акции', web_app: { url: webAppUrl + '/discounts' } }],
            [{ text: '👤 Профиль', web_app: { url: webAppUrl + '/profile' } }],
            [{ text: '📱 Контакты', web_app: { url: webAppUrl + '/contacts' } }]
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

    setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
    }, 3000);
    } catch (e) {
        console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    try {
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
    input_message_content: {
        message_text: ` Не удалось произвести покупку, вы пытались приобрести товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
    };
    return res.status(500).json({});
}
});

app.post('/calculate-distance', async (req, res) => {
    const { address1, address2 } = req.body;

    try {
    const distance = await calculateDistance(address1, address2);
    return res.status(200).json({ distance });
    } catch (error) {
    console.error('Error calculating distance:', error.message);
    return res.status(500).json({ error: 'Error calculating distance' });
    }
});

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
