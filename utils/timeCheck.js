module.exports = {
    isWorkingHours: function () {
        // Получаем текущее время по Минску
        const minskTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Minsk' });
        const currentHour = new Date(minskTime).getHours();

        // Проверяем, что текущее время находится в интервале с 10 утра до 8 вечера
        return currentHour >= 10 && currentHour < 20;
    }
};
