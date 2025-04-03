// Configuración de ThingSpeak
const CHANNEL_ID = "2900882";
const READ_API_KEY = "MXELEA8B0RMWVU8K"; // Usar READ API KEY
const API_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`;

// Elementos del DOM
const tempElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const precipitationElement = document.getElementById('precipitation');
const timeElement = document.getElementById('current-time');

// Inicializar gráfico
let weatherChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    updateDashboard();
    setInterval(updateDashboard, 50000);
});

async function updateDashboard() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Actualizar métricas
        tempElement.textContent = data.field1 || '--';
        humidityElement.textContent = data.field2 || '--';
        precipitationElement.textContent = data.field3 || '--';
        
        // Actualizar hora
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-ES', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/^\w/, c => c.toUpperCase());

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function initializeChart() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [18.3, 17.8, 20.1, 24.7, 26.2, 22.5],
                borderColor: '#ffffff',
                tension: 0.4
            },
            {
                label: 'Humedad (%RH)',
                data: [75, 78, 72, 68, 65, 70],
                borderColor: '#4CAF50',
                tension: 0.4
            },
            {
                label: 'Precipitación (ml/m³)',
                data: [200, 180, 400, 850, 900, 750],
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
}
