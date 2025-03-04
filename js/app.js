window.onload = () => {
    const loading = document.getElementById('loading');
    const instructions = document.getElementById('instructions');
    const distanceInfo = document.getElementById('distance-info');

    // Координаты объекта
    const targetLat = 51.145978;
    const targetLon = 71.471626;

    console.log('Целевые координаты:', { targetLat, targetLon });

    // Проверка поддержки необходимых API
    checkDeviceSupport();

    // Инициализация системы
    document.querySelector('a-scene').addEventListener('loaded', () => {
        loading.style.display = 'none';
        console.log('A-Frame сцена загружена');
    });

    // Обработка ошибок
    document.querySelector('a-scene').addEventListener('camera-error', (error) => {
        console.error('Ошибка камеры:', error);
        showError('Ошибка камеры: ' + error.detail.message);
    });

    // Обработка изменения позиции
    document.querySelector('[gps-camera]').addEventListener('gps-camera-update-position', (event) => {
        console.log('Получены новые GPS координаты:', event.detail.position);
        
        const distance = calculateDistance(
            event.detail.position.latitude,
            event.detail.position.longitude,
            targetLat,
            targetLon
        );
        
        console.log('Рассчитанное расстояние:', distance);
        distanceInfo.textContent = `Расстояние до объекта: ${Math.round(distance)} метров`;
        instructions.style.display = 'none';
    });

    // Запрос геолокации
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                console.log('Геолокация обновлена:', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                loading.style.display = 'none';
            },
            (error) => {
                console.error('Ошибка геолокации:', error);
                showError('Ошибка геолокации: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    } else {
        showError('Геолокация не поддерживается');
    }
};

function checkDeviceSupport() {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext) {
        showError('WebGL не поддерживается. Попробуйте другой браузер.');
        return false;
    }

    // Проверка поддержки ориентации устройства
    if (!window.DeviceOrientationEvent) {
        showError('Датчик ориентации не поддерживается.');
        return false;
    }

    // Проверка поддержки камеры
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Камера не поддерживается.');
        return false;
    }

    return true;
}

function showError(message) {
    console.error(message);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 5000);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
} 