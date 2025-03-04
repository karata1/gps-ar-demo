window.onload = () => {
    const distanceInfo = document.getElementById('distance-info');
    const loading = document.getElementById('loading');

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

    // Обработка обновления позиции
    window.addEventListener('gps-camera-origin-coord-set', () => {
        distanceInfo.textContent = 'GPS позиция установлена';
    });

    window.addEventListener('gps-camera-update-position', (e) => {
        const box = document.querySelector('a-box');
        if (!box.getAttribute('gps-entity-place')) return;

        const distance = calculateDistance(
            e.detail.position.latitude,
            e.detail.position.longitude,
            box.getAttribute('gps-entity-place').latitude,
            box.getAttribute('gps-entity-place').longitude
        );

        distanceInfo.textContent = `Расстояние до объекта: ${Math.round(distance)} метров`;
    });

    // Обработка ошибок
    window.addEventListener('gps-camera-update-position', (error) => {
        if (error) {
            showError('Ошибка обновления позиции: ' + error.detail.message);
        }
    });

    window.addEventListener('camera-error', (error) => {
        showError('Ошибка камеры: ' + error.detail.message);
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