window.onload = () => {
    const loading = document.getElementById('loading');
    const instructions = document.getElementById('instructions');
    const distanceInfo = document.getElementById('distance-info');
    const coordinatesInfo = document.getElementById('coordinates-info');

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

    let lastPosition = null;

    // Обработка изменения позиции камеры
    const camera = document.querySelector('[gps-camera]');
    camera.addEventListener('gps-camera-update-position', (event) => {
        lastPosition = event.detail.position;
        updatePositionInfo(lastPosition);
    });

    function updatePositionInfo(position) {
        if (!position) return;

        console.log('Обновление информации о позиции:', position);

        // Обновляем информацию о координатах
        coordinatesInfo.textContent = `Ваши координаты: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
        
        // Рассчитываем расстояние
        const distance = calculateDistance(
            position.latitude,
            position.longitude,
            targetLat,
            targetLon
        );
        
        console.log('Рассчитанное расстояние:', distance);
        distanceInfo.textContent = `Расстояние до объекта: ${Math.round(distance)} метров`;
        instructions.style.display = 'none';
    }

    // Запрос геолокации через браузерное API
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                console.log('Геолокация обновлена через браузер:', coords);
                
                // Если нет обновлений от AR.js, используем браузерную геолокацию
                if (!lastPosition) {
                    updatePositionInfo(coords);
                }
                
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

// Регистрация компонента gps-cube
AFRAME.registerComponent('gps-cube', {
    init: function() {
        this.el.setAttribute('material', 'color: red');
        this.el.setAttribute('scale', '20 20 20');
        
        // Устанавливаем позицию на уровне земли
        this.el.setAttribute('position', {x: 0, y: 0, z: 0});
        
        // Добавляем обработчик для фиксации позиции
        this.el.addEventListener('componentchanged', (evt) => {
            if (evt.detail.name === 'position') {
                // Если позиция изменилась, возвращаем на землю
                const position = this.el.getAttribute('position');
                if (position.y !== 0) {
                    position.y = 0;
                    this.el.setAttribute('position', position);
                }
            }
        });
    },
    
    tick: function() {
        // Принудительно устанавливаем Y-координату в 0
        const position = this.el.getAttribute('position');
        if (position && position.y !== 0) {
            position.y = 0;
            this.el.setAttribute('position', position);
        }
    }
}); 