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

        // Fetch user's address from the Users table
        const fetchAddressQuery = `SELECT address FROM Users WHERE username = '${username}'`;

        db.query(fetchAddressQuery, async (err, addressResult) => {
            if (err) throw err;

            if (addressResult.length > 0) {
                const userAddress = addressResult[0].address;

                // Update the Orders table with the user's address
                const updateOrdersQuery = `
                    INSERT INTO Orders (userorder, TotalPrice, username, Address)
                    VALUES ('${productsString}', ${totalPrice}, '${username}', '${userAddress}')
                `;

                db.query(updateOrdersQuery, (updateErr, result) => {
                    if (updateErr) throw updateErr;
                    console.log("1 record inserted with address");
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
            } else {
                // User not found in Users table
                // TODO: ADD LIKE THIS
                // Change this line based on the actual property in your user object
                // await bot.sendMessage(user.telegramId, 'Для оформления заказа, пожалуйста, начните с заполнения формы доставки.');
                throw new Error('User not found in Users table');
            }
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({});
    }
});

module.exports = router;
