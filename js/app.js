window.onload = () => {
    const loading = document.getElementById('loading');
    const instructions = document.getElementById('instructions');
    const distanceInfo = document.getElementById('distance-info');

    // Координаты объекта
    const targetLat = 51.145978;
    const targetLon = 71.471626;

    // Инициализация системы
    document.querySelector('a-scene').addEventListener('loaded', () => {
        loading.style.display = 'none';
    });

    // Обработка ошибок
    document.querySelector('a-scene').addEventListener('camera-error', (error) => {
        showError('Ошибка камеры: ' + error.detail.message);
    });

    // Обработка изменения позиции
    document.querySelector('[gps-camera]').addEventListener('gps-camera-update-position', (event) => {
        const distance = calculateDistance(
            event.detail.position.latitude,
            event.detail.position.longitude,
            targetLat,
            targetLon
        );
        
        distanceInfo.textContent = `Расстояние до объекта: ${Math.round(distance)} метров`;
        instructions.style.display = 'none';
    });

    // Проверка поддержки геолокации
    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }

    // Запрос текущей позиции
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('Геолокация получена:', position);
        },
        (error) => {
            let errorMessage = 'Ошибка геолокации: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Доступ к геолокации запрещен';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Информация о местоположении недоступна';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Превышено время ожидания';
                    break;
                default:
                    errorMessage += error.message;
            }
            showError(errorMessage);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000
        }
    );
};

// Вспомогательные функции
function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
    
    // Удаляем сообщение об ошибке через 5 секунд
    setTimeout(() => {
        error.remove();
    }, 5000);
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