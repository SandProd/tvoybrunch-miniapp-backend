
const http = require('http'); // Подключение модуля http для создания HTTP-сервера
const express = require('express'); // Подключение модуля express для создания веб-приложения
const cors = require('cors'); // Подключение модуля cors для обработки CORS-запросов
const db = require('./db'); // Подключение файла db.js, содержащего логику подключения к базе данных
const productsRouter = require('./routes/products'); // Подключение файла products.js, содержащего маршруты для работы с продуктами
const bot = require('./telegramBot'); // Подключение файла telegramBot.js, содержащего логику работы с Telegram ботом
const webDataRouter = require('./routes/webData'); // Подключение файла webData.js, содержащего маршрут для обработки данных от веб-приложения

const PORT = '3000'; // Установка порта, на котором будет слушать сервер
const HOSTNAME = '127.1.1.141'; // Установка хоста, на котором будет слушать сервер

const app = express(); // Создание экземпляра приложения Express
app.use(express.static('public')); // Использование статических файлов из папки 'public'
app.use(express.json()); // Использование middleware для обработки JSON-запросов
app.use(cors()); // Использование middleware для обработки CORS

app.use(bot.middleware()); // Использование middleware для интеграции с Telegram ботом

// Установка соединения с базой данных при запуске сервера
db.connect((err) => { 
    if (err) throw err;
    console.log("Connected!");
});

app.use('/products', productsRouter); // Подключение маршрутов для работы с продуктами по пути '/products'
app.use('/web-data', webDataRouter); // Подключение маршрута для обработки данных от веб-приложения по пути '/web-data'

// Запуск сервера на указанном порту и хосте. Вывод в консоль информации о запуске
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
