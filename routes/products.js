const express = require('express');
const router = express.Router();
const connection = require('../db');

// Добавление нового продукта
router.post('/', (req, res) => {
    const { name, price } = req.body;
    const sql = 'INSERT INTO Products (name, price) VALUES (?, ?)';

    connection.query(sql, [name, price], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.status(201).json({ message: 'Продукт успешно добавлен' });
    });
});

// Получение всех продуктов
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Products';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// Получение конкретного продукта по Id
router.get('/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM Products WHERE Id = ?';

    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json(result[0]);
        }
    });
});

// Обновление продукта по Id
router.put('/:id', (req, res) => {
    const productId = req.params.id;
    const { name, price } = req.body;
    const sql = 'UPDATE Products SET name = ?, price = ? WHERE Id = ?';

    connection.query(sql, [name, price, productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json({ message: 'Продукт успешно обновлен' });
        }
    });
});

// Удаление продукта по Id
router.delete('/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM Products WHERE Id = ?';

    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Ошибка запроса к базе данных: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Продукт не найден' });
        } else {
            res.json({ message: 'Продукт успешно удален' });
        }
    });
});

module.exports = router;
