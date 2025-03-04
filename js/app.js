window.onload = () => {
    const loading = document.getElementById('loading');
    const instructions = document.getElementById('instructions');

    // Инициализация системы
    document.querySelector('a-scene').addEventListener('loaded', () => {
        loading.style.display = 'none';
        setTimeout(() => {
            instructions.style.display = 'none';
        }, 5000);
    });

    // Обработка ошибок
    document.querySelector('a-scene').addEventListener('camera-error', (error) => {
        showError('Ошибка камеры: ' + error.detail.message);
    });
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