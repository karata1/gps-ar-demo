window.onload = () => {
    const distanceInfo = document.getElementById('distance-info');
    const loading = document.getElementById('loading');
    const instructions = document.getElementById('instructions');
    let isPlaced = false;

    // Проверка поддержки необходимых API
    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }

    // Настройка точности геолокации
    const geoOptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000
    };

    // Инициализация системы
    document.querySelector('a-scene').addEventListener('loaded', () => {
        loading.style.display = 'none';
    });

    // Обработка клика по поверхности
    const surface = document.querySelector('#surface');
    surface.addEventListener('click', (event) => {
        if (!isPlaced) {
            isPlaced = true;
            instructions.style.display = 'none';
            distanceInfo.textContent = 'Объект размещен на поверхности';
        }
    });

    // Обработка ошибок
    document.querySelector('a-scene').addEventListener('camera-error', (error) => {
        showError('Ошибка камеры: ' + error.detail.message);
    });

    // Обработка определения поверхности
    document.querySelector('a-scene').addEventListener('ar-hit-test-start', () => {
        distanceInfo.textContent = 'Ищем поверхность...';
    });

    document.querySelector('a-scene').addEventListener('ar-hit-test-achieved', () => {
        if (!isPlaced) {
            distanceInfo.textContent = 'Нажмите на поверхность, чтобы разместить объект';
        }
    });
};

// Вспомогательные функции
function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // радиус Земли в метрах
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // расстояние в метрах
} 