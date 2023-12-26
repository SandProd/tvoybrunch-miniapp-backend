const express = require('express');
const cors = require('cors');
const db = require('./configs/db');
const productsRouter = require('./routes/products');
const webDataRouter = require('./routes/webData');
const logger = require('./configs/logger');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Database connection
(async () => {
    try {
        await db;
        logger.info("Connected to the database");
    } catch (err) {
        logger.error("Error connecting to the database:", err);
        process.exit(1);
    }
})();

// Routes
app.use('/products', productsRouter);
app.use('/web-data', webDataRouter);

// Server listening
const PORT = 3000;
const HOSTNAME = '127.1.1.141';

app.listen(PORT, HOSTNAME, () => {
    logger.info(`Server started on ${HOSTNAME}:${PORT}`);
});

// Error handler middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
