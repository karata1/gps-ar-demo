window.onload = () => {
    const loading = document.getElementById('loading');
    const permissions = document.getElementById('permissions');
    const distanceInfo = document.getElementById('distance-info');
    const coordinatesInfo = document.getElementById('coordinates-info');
    const permitButton = document.getElementById('permitButton');

    // Координаты объекта
    const targetLat = 51.145978;
    const targetLon = 71.471626;

    console.log('Целевые координаты:', { targetLat, targetLon });

    // Сначала скрываем AR сцену
    const scene = document.querySelector('a-scene');
    scene.style.display = 'none';

    scene.addEventListener('loaded', () => {
        console.log('A-Frame сцена загружена');
        initAR();
    });

    // Обработка ошибок камеры
    scene.addEventListener('camera-error', (error) => {
        console.error('Ошибка камеры:', error);
        showError('Ошибка камеры: ' + error.detail.message);
    });

    let lastPosition = null;
    let isInitialized = false;

    async function initAR() {
        try {
            // Проверяем поддержку необходимых API
            if (!checkDeviceSupport()) {
                return;
            }

            // Запрашиваем разрешения при нажатии на кнопку
            permitButton.addEventListener('click', async () => {
                try {
                    loading.style.display = 'flex';
                    permissions.style.display = 'none';
                    
                    await requestPermissions();
                    
                    // После получения всех разрешений
                    loading.style.display = 'none';
                    scene.style.display = 'block'; // Показываем AR сцену
                    await startAR();
                } catch (error) {
                    console.error('Ошибка при запросе разрешений:', error);
                    showError('Пожалуйста, предоставьте все необходимые разрешения для работы AR');
                    permissions.style.display = 'block';
                    loading.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Ошибка инициализации AR:', error);
            showError('Ошибка инициализации AR: ' + error.message);
        }
    }

    async function startAR() {
        if (isInitialized) return;
        isInitialized = true;

        // Настройка камеры AR
        const camera = document.querySelector('[gps-camera]');
        camera.addEventListener('gps-camera-update-position', (event) => {
            lastPosition = event.detail.position;
            updatePositionInfo(lastPosition);
        });

        // Запуск отслеживания геолокации
        initGeolocation();
    }

    // Функция запроса всех необходимых разрешений
    async function requestPermissions() {
        try {
            // Сначала запрашиваем разрешение на геолокацию
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });
            console.log('Разрешение на геолокацию получено');

            // Затем запрашиваем разрешение на использование камеры
            await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment'
                } 
            });
            console.log('Разрешение на камеру получено');

            // Запрос разрешения на использование датчиков движения (для iOS)
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Необходим доступ к датчикам движения');
                }
                console.log('Разрешение на датчики движения получено');
            }

        } catch (error) {
            console.error('Ошибка при запросе разрешений:', error);
            throw error;
        }
    }

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
    }

    function initGeolocation() {
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