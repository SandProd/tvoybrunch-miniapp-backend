const http = require('http');
const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

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
const connection = mysql.createConnection({
    host: 'tvoybruc.mysql.tools',
    user: 'tvoybruc_db',
    password: 'wjtMG2Wc',
    database: 'tvoybruc_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    const sql = "SELECT * FROM Orders";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Result: ");
        console.log(result);
    });
});

// Server route
app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    try {
        const sql = `INSERT INTO Orders (username, userorder, TotalPrice) VALUES ('${Username}', '${products.map(item => item.title).join(', ')}', ${totalPrice})`;
        connection.query(sql, (err, result) => {
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

// Добавление нового продукта
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    const sql = 'INSERT INTO Products (name, price) VALUES (?, ?)';
  
    connection.query(sql, [name, price], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.status(201).json({ message: 'Продукт успешно добавлен' });
    });
});

// Получение всех продуктов
app.get('/products', (req, res) => {
    const sql = 'SELECT * FROM Products';
  
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// Получение конкретного продукта по Id
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM Products WHERE Id = ?';
  
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json(result[0]);
        }
    });
});

// Обновление продукта по Id
app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, price } = req.body;
    const sql = 'UPDATE Products SET name = ?, price = ? WHERE Id = ?';
  
    connection.query(sql, [name, price, productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json({ message: 'Продукт успешно обновлен' });
        }
    });
});

// Удаление продукта по Id
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM Products WHERE Id = ?';
  
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json({ message: 'Продукт успешно удален' });
        }
    });
});

// Server listening
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
