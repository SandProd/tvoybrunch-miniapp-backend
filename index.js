const express = require('express');
const cors = require('cors');
const db = require('./db');
const productsRouter = require('./routes/products');
const bot = require('./telegramBot'); // Importing the Telegram bot instance
const webDataRouter = require('./routes/webData');

const PORT = '3000';
const HOSTNAME = '127.1.1.141';

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Bot middleware for integration with Telegram bot
app.use(bot.middleware());

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

// Products route
app.use('/products', productsRouter);

// WebData route
app.use('/web-data', webDataRouter);

// Server listening
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
});
