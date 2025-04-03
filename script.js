// Configuración de ThingSpeak
const CHANNEL_ID = "2900882";
const READ_API_KEY = "MXELEA8B0RMWVU8K"; // Usar READ API KEY
const API_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`;
const FEEDS_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=12`;

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
            const labels = data.feeds.map(feed => {
                const date = new Date(feed.created_at);
                return date.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            });
            
            const tempData = data.feeds.map(feed => feed.field1);
            const humidityData = data.feeds.map(feed => feed.field2);
            const precipitationData = data.feeds.map(feed => feed.field3);
            
            // Actualizar datos del gráfico
            weatherChart.data.labels = labels;
            weatherChart.data.datasets[0].data = tempData;
            weatherChart.data.datasets[1].data = humidityData;
            weatherChart.data.datasets[2].data = precipitationData;
            
            weatherChart.update();
        }
    } catch (error) {
        console.error("Error al actualizar el gráfico:", error);
    }
}

function initializeChart() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['--:--', '--:--', '--:--', '--:--', '--:--', '--:--'],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#ffffff',
                tension: 0.4
            },
            {
                label: 'Humedad (%RH)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#4CAF50',
                tension: 0.4
            },
            {
                label: 'Precipitación (ml/m³)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#2196F3',
                tension: 0.4
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
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
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