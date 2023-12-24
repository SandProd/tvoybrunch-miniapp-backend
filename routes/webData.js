const express = require('express');
const db = require('../db');
const { bot } = require('../telegramBot');
const logger = require('../logger');
const { transporter, sendEmail } = require('../mail');

const router = express.Router();

router.post('/', async (req, res) => {
    const { queryId, products = [], totalPrice, user } = req.body;

    try {
        const productsString = products.map(item => item.title).join(', ');
        const username = user ? user.username : 'Unknown User';
        const fetchAddressQuery = `SELECT address FROM Users WHERE username = '${username}'`;

        db.query(fetchAddressQuery, async (err, addressResult) => {
            if (err) throw err;

            if (addressResult.length > 0) {
                const userAddress = addressResult[0].address;

                const updateOrdersQuery = `
                    INSERT INTO Orders (userorder, TotalPrice, username, Address)
                    VALUES ('${productsString}', ${totalPrice}, '${username}', '${userAddress}')
                `;

                db.query(updateOrdersQuery, (updateErr, result) => {
                    if (updateErr) throw updateErr;
                    logger.info("1 record inserted with address");
                });

                const recipientEmail = 'vajgleb03@gmail.com';

                // Send email using the function from mail.js
                sendEmail(recipientEmail, 'Новый заказ', `Новый заказ от ${username}:\n${productsString}\nОбщая сумма: ${totalPrice} BYN\nАдрес: ${userAddress}`, function (error, info) {
                    if (error) {
                        logger.error('Ошибка отправки письма:', error);
                    } else {
                        console.log('Письмо отправлено: ' + info.response);
                    }
                });

                // Send message to the user
                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Успешная покупка',
                    input_message_content: {
                        message_text: ` Поздравляю с покупкой, ${username}, вы приобрели товар на сумму ${totalPrice} BYN: ${productsString}`
                    }
                });

                return res.status(200).json({});
            } else {
                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Ошибка, заполните форму для отправки заказа',
                    input_message_content: {
                        message_text: ` 'Для оформления заказа, пожалуйста, начните с заполнения формы доставки.'`
                    }
                });
                throw new Error('User not found in Users table');
            }
        });
    } catch (e) {
        logger.info(e);
        return res.status(500).json({});
    }
});

module.exports = router;
