const express = require('express');
const cors = require('cors');
const db = require('./db');
const productsRouter = require('./routes/products');
const webDataRouter = require('./routes/webData');
const logger = require('./logger');  // Import the logger module
const config = require('./config');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Database connection
db.connect((err) => {
    if (err) throw err;
    logger.info("Connected to the database");
});

// Routes
app.use('/products', productsRouter);
app.use('/web-data', webDataRouter);

// Server listening
app.listen(config.PORT, config.HOSTNAME, () => {
    logger.info(`Server started on ${config.HOSTNAME}:${config.PORT}`);
});

// Обработчик ошибок Express
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
