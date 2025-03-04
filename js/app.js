window.onload = () => {
    const distanceInfo = document.getElementById('distance-info');
    const loading = document.getElementById('loading');
    let entities = [];

    // Проверка поддержки необходимых API
    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }

    // Загрузка данных о точках
    fetch('./data/videos.json')
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            initializeAR(data.videos);
        })
        .catch(error => {
            showError('Ошибка загрузки данных: ' + error.message);
        });

    function initializeAR(locations) {
        // Создание кубов
        locations.forEach(locationData => {
            // Создание AR сущности (куба)
            const entity = document.createElement('a-box');
            entity.setAttribute('gps-entity-place', `latitude: ${locationData.latitude}; longitude: ${locationData.longitude}`);
            entity.setAttribute('material', 'color: red');
            entity.setAttribute('scale', '20 20 20'); // Увеличенный размер для лучшей видимости
            entity.setAttribute('animation', 'property: rotation; dur: 3000; to: 0 360 0; loop: true'); // Вращение для наглядности
            
            document.querySelector('a-scene').appendChild(entity);
            entities.push({
                entity,
                data: locationData
            });
        });
    }

    // Обновление информации о расстоянии
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const currentLat = position.coords.latitude;
            const currentLon = position.coords.longitude;

            let closestDistance = Infinity;
            entities.forEach(({data}) => {
                const distance = calculateDistance(
                    currentLat,
                    currentLon,
                    data.latitude,
                    data.longitude
                );
                if (distance < closestDistance) {
                    closestDistance = distance;
                }
            });

            distanceInfo.textContent = `Ближайший объект: ${Math.round(closestDistance)} метров`;
        });
    }, 1000);
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