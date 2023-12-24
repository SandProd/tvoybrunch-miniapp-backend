const express = require('express');
const db = require('../db');
const { bot } = require('../telegramBot');
const logger = require('../logger');
const { transporter, sendEmail } = require('../mail');
const timeCheck = require('../timeCheck');

const router = express.Router();

router.post('/', async (req, res) => {
    const { queryId, products = [], totalPrice, user } = req.body;

    try {
        // Проверяем, что текущее время находится в интервале с 10 утра до 8 вечера
        if (!timeCheck.isWorkingHours()) {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Время заказа',
                input_message_content: {
                    message_text: 'Извините, мы принимаем заказы только с 10 утра до 8 вечера по времени Минска.'
                }
            });
            return res.status(200).json({});
        }

        const productsString = products.map(item => item.title).join(', ');
        const username = user ? user.username : 'Unknown User';
        const fetchAddressQuery = `SELECT address FROM Users WHERE username = '${username}'`;

        try {
            db.query(fetchAddressQuery, async (err, addressResult) => {
                if (err) {
                    logger.error(`Ошибка при выполнении запроса на получение адреса пользователя (${username}): ${err}`);
                    return res.status(500).json({});
                }

                if (addressResult.length > 0) {
                    const userAddress = addressResult[0].address;

                    const updateOrdersQuery = `
                        INSERT INTO Orders (userorder, TotalPrice, username, Address)
                        VALUES ('${productsString}', ${totalPrice}, '${username}', '${userAddress}')
                    `;

                    try {
                        db.query(updateOrdersQuery, (updateErr, result) => {
                            if (updateErr) {
                                logger.error(`Ошибка при выполнении запроса на обновление заказа (${username}): ${updateErr}`);
                            } else {
                                logger.info(`1 record inserted with address (${username})`);
                            }
                        });

                        const recipientEmail = 'vajgleb03@gmail.com';

                        // Send email using the function from mail.js
                        sendEmail(recipientEmail, 'Новый заказ', `Новый заказ от ${username}:\n${productsString}\nОбщая сумма: ${totalPrice} BYN\nАдрес: ${userAddress}`, function (error, info) {
                            if (error) {
                                logger.error(`Ошибка отправки письма (${username}): ${error}`);
                            } else {
                                logger.info(`Письмо отправлено (${username}): ${info.response}`);
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
                    } catch (updateErr) {
                        logger.error(`Ошибка при выполнении запроса на обновление заказа (${username}): ${updateErr}`);
                        return res.status(500).json({});
                    }
                } else {
                    await bot.answerWebAppQuery(queryId, {
                        type: 'article',
                        id: queryId,
                        title: 'Ошибка, заполните форму для отправки заказа',
                        input_message_content: {
                            message_text: ` 'Для оформления заказа, пожалуйста, начните с заполнения формы доставки.'`
                        }
                    });
                    logger.error(`Пользователь не найден в таблице Users (${username})`);
                    throw new Error('User not found in Users table');
                }
            });
        } catch (e) {
            logger.error(`Произошла ошибка при выполнении запроса (${username}): ${e}`);
            return res.status(500).json({});
        }
    } catch (e) {
        logger.error(`Произошла ошибка при обработке запроса к серверу (${username}): ${e}`);
        return res.status(500).json({});
    }
});

module.exports = router;
