const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

function getDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Радиус Земли в километрах
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Расстояние в километрах

  return distance;
}

async function calculateDistanceAndCost(origin, destination, deliveryRate) {
  try {
    const result = await geocoder.geocode(origin);
    const originCoords = [result[0].latitude, result[0].longitude];

    const destinationResult = await geocoder.geocode(destination);
    const destinationCoords = [destinationResult[0].latitude, destinationResult[0].longitude];

    // Расчет расстояния
    const distance = getDistance(originCoords, destinationCoords);

    // Расчет стоимости доставки
    const deliveryCost = distance * deliveryRate;

    return deliveryCost;
  } catch (error) {
    console.error('Ошибка при расчете расстояния и стоимости доставки:', error);
    throw error; // Пересылаем ошибку дальше
  }
}

module.exports = { calculateDistanceAndCost };
