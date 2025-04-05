// Configuración de ThingSpeak
const CHANNEL_ID = "2906469";
const READ_API_KEY = "2UL4L7DNEE1B8TDB"; // Usar READ API KEY
const API_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`;

// Para obtener datos de las últimas 12 horas con más entradas
// 24 entradas = 12 horas con intervalos de 30 minutos
const FEEDS_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=144`;

// Elementos del DOM
const tempElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const precipitationElement = document.getElementById('precipitation');
const timeElement = document.getElementById('current-time');

// Inicializar gráfico
let weatherChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Manejo de pestañas
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover la clase active de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            // Añadir la clase active a la pestaña actual
            tab.classList.add('active');
            
            // Remover la clase active de todos los contenidos
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido correspondiente
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Si se selecciona la pestaña histórica y el gráfico no está inicializado
            if (tabId === 'historical' && !weatherChart) {
                initializeChart();
            }
        });
    });

    // Inicializar la aplicación
    updateDashboard();
    initializeChart();
    
    // Actualizar los datos cada 5 minutos (300000 ms)
    setInterval(updateDashboard, 300000);
    
    // Actualizar el reloj cada minuto
    updateClock();
    setInterval(updateClock, 60000);
});

async function updateDashboard() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Actualizar métricas
        tempElement.textContent = data.field1 || '--';
        humidityElement.textContent = data.field2 || '--';
        precipitationElement.textContent = data.field3 || '--';
        
        // Actualizar gráfico si existe
        if (weatherChart) {
            updateChart();
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function updateClock() {
    // Actualizar hora
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('es-ES', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/^\w/, c => c.toUpperCase());
}

async function updateChart() {
    try {
        const response = await fetch(FEEDS_URL);
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
            // Formatear datos para mostrar cada 30 minutos en un periodo de 12 horas
            const formattedData = formatDataFor30MinIntervals(data.feeds);
            
            // Actualizar datos del gráfico
            weatherChart.data.labels = formattedData.labels;
            weatherChart.data.datasets[0].data = formattedData.temperatures;
            weatherChart.data.datasets[1].data = formattedData.humidities;
            weatherChart.data.datasets[2].data = formattedData.precipitations;
            
            weatherChart.update();
        }
    } catch (error) {
        console.error("Error al actualizar el gráfico:", error);
    }
}

// Función para formatear los datos en intervalos de 30 minutos
function formatDataFor30MinIntervals(feeds) {
    // Mapeo para almacenar datos por intervalos de 30 minutos
    const intervalMap = new Map();
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    // Crear etiquetas para las últimas 12 horas con intervalos de 30 minutos
    const labels = [];
    const temperatures = [];
    const humidities = [];
    const precipitations = [];
    
    // Generar etiquetas de tiempo cada 30 minutos durante 12 horas
    for (let i = 0; i < 24; i++) {
        const timePoint = new Date(twelveHoursAgo.getTime() + i * 30 * 60 * 1000);
        const hour = timePoint.getHours();
        const minutes = timePoint.getMinutes();
        const label = `${hour}:${minutes === 0 ? '00' : '30'}`;
        labels.push(label);
        
        // Inicializar con valores null (se rellenarán si hay datos)
        temperatures.push(null);
        humidities.push(null);
        precipitations.push(null);
    }
    
    // Procesar los feeds y asignarlos al intervalo más cercano
    feeds.forEach(feed => {
        const feedDate = new Date(feed.created_at);
        
        // Solo considerar feeds dentro de las últimas 12 horas
        if (feedDate >= twelveHoursAgo && feedDate <= now) {
            // Determinar en qué intervalo de 30 minutos cae este feed
            const minutesFromStart = Math.floor((feedDate - twelveHoursAgo) / (30 * 60 * 1000));
            if (minutesFromStart >= 0 && minutesFromStart < 24) {
                // Actualizar con los valores más recientes para ese intervalo
                temperatures[minutesFromStart] = parseFloat(feed.field1) || null;
                humidities[minutesFromStart] = parseFloat(feed.field2) || null;
                precipitations[minutesFromStart] = parseFloat(feed.field3) || null;
            }
        }
    });
    
    // Rellenar valores nulos con el valor anterior si está disponible
    for (let i = 1; i < 24; i++) {
        if (temperatures[i] === null) temperatures[i] = temperatures[i-1];
        if (humidities[i] === null) humidities[i] = humidities[i-1];
        if (precipitations[i] === null) precipitations[i] = precipitations[i-1];
    }
    
    return {
        labels,
        temperatures,
        humidities,
        precipitations
    };
}

function initializeChart() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(24).fill('--:--'), // 24 intervalos de 30 minutos = 12 horas
            datasets: [{
                label: 'Temperatura (°C)',
                data: Array(24).fill(null),
                borderColor: '#ffffff',
                tension: 0.4,
                spanGaps: true // Conectar líneas a través de valores nulos
            },
            {
                label: 'Humedad (%RH)',
                data: Array(24).fill(null),
                borderColor: '#4CAF50',
                tension: 0.4,
                spanGaps: true
            },
            {
                label: 'Precipitación (ml/m³)',
                data: Array(24).fill(null),
                borderColor: '#2196F3',
                tension: 0.4,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItem) {
                            return 'Hora: ' + tooltipItem[0].label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        color: '#ffffff',
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index, values) {
                            // Mostrar solo las etiquetas cada hora completa
                            return index % 2 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
    
    // Cargar datos iniciales del gráfico
    updateChart();
}
