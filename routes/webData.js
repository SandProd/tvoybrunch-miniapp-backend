const express = require('express');
const db = require('../db');
const bot = require('../telegramBot');

const router = express.Router();

router.post('/', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    try {
        const sql = `INSERT INTO Orders (username, userorder, TotalPrice) VALUES ('${bot.Username}', '${products.map(item => item.title).join(', ')}', ${totalPrice})`;
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

module.exports = router;
