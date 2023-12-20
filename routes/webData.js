const express = require('express');
const db = require('../db');
const bot = require('../telegramBot');

const router = express.Router();

router.post('/', async (req, res) => {
    const { queryId, products = [], totalPrice, user } = req.body;

    try {
        const productsString = products.map(item => item.title).join(', ');

        // Assuming user is an object with a username property
        const username = user ? user.username : 'Unknown User';

        const sql = `INSERT INTO Orders (userorder, TotalPrice, username) VALUES ('${productsString}', ${totalPrice}, '${username}')`;
        
        db.query(sql, (err, result) => {
            if (err) throw err;
            console.log("1 record inserted");
        });

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, ${username}, вы приобрели товар на сумму ${totalPrice} BYN: ${productsString}`
            }
        });

        return res.status(200).json({});
    } catch (e) {
        console.log(e);
        return res.status(500).json({});
    }
});

module.exports = router;
