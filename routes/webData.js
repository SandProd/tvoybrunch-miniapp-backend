const express = require('express');
const db = require('../db');
const { bot } = require('../telegramBot');
const nodemailer = require('nodemailer');

const router = express.Router();

// Создайте объект транспорта для отправки писем
const transporter = nodemailer.createTransport({
    host: 'mail.adm.tools',
    port: 25,  // Используйте порт 25 для SMTP
    secure: false,  // Установите в false, так как это порт без SSL
    auth: {
        user: 'orders@tvoybranch-backend.space', // Ваш электронный адрес
        pass: 'u55G3f5iCE' // Ваш пароль от электронной почты
    }
});

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
                    console.log("1 record inserted with address");
                });

                // Замените 'recipient@example.com' на ваш адрес электронной почты
                const recipientEmail = 'vajgleb03@gmail.com';

                // Отправьте письмо на электронную почту
                const mailOptions = {
                    from: 'orders@tvoybranch-backend.space',
                    to: recipientEmail,
                    subject: 'Новый заказ',
                    text: `Новый заказ от ${username}:\n${productsString}\nОбщая сумма: ${totalPrice} BYN\nАдрес: ${userAddress}`
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.error('Ошибка отправки письма: ' + error);
                    } else {
                        console.log('Письмо отправлено: ' + info.response);
                    }
                });

                // Отправьте сообщение пользователю
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
        console.log(e);
        return res.status(500).json({});
    }
});

module.exports = router;
