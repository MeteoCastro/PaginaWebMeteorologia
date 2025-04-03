// Efecto de estrellas (mantenido igual)
function createStarfield() {
    const container = document.querySelector('.starfield');
    const starCount = 500;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 3 + 2}s;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(star);
    }
}

// Efecto de estela del ratón (modificado)
function initMouseTrail() {
    const canvas = document.getElementById('mouse-trail');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let points = [];
    let mousePos = { x: 0, y: 0 };
    let trailLength = 20; // Número de puntos en la estela
    
    // Seguir la posición del ratón
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });
    
    // Función para animar la estela
    function animate() {
        // Añadir la posición actual del ratón al inicio del array
        points.unshift({ x: mousePos.x, y: mousePos.y });
        
        // Limitar el tamaño del array para mantener la longitud de la estela
        if (points.length > trailLength) {
            points = points.slice(0, trailLength);
        }
        
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar la estela
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Crear un degradado para la estela
        const gradient = ctx.createLinearGradient(
            points[0].x, points[0].y, 
            points[points.length - 1]?.x || points[0].x, 
            points[points.length - 1]?.y || points[0].y
        );
        
        gradient.addColorStop(0, 'rgba(0, 176, 255, 1)');    // Azul claro al inicio
        gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.8)'); // Violeta en el medio
        gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');     // Rosa al final (transparente)
        
        ctx.strokeStyle = gradient;
        
        // Dibujar la línea si hay suficientes puntos
        if (points.length > 1) {
            ctx.moveTo(points[0].x, points[0].y);
            
            // Crear una curva suave entre los puntos
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            
            // Conectar con el último punto si existe
            if (points.length > 1) {
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            }
            
            ctx.stroke();
        }
        
        // Dibujar un pequeño brillo en la posición actual del ratón
        ctx.beginPath();
        const glow = ctx.createRadialGradient(
            mousePos.x, mousePos.y, 0,
            mousePos.x, mousePos.y, 15
        );
        glow.addColorStop(0, 'rgba(0, 176, 255, 0.7)');
        glow.addColorStop(1, 'rgba(0, 176, 255, 0)');
        
        ctx.fillStyle = glow;
        ctx.arc(mousePos.x, mousePos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        requestAnimationFrame(animate);
    }
    
    // Iniciar la animación
    animate();
    
    // Ajustar el tamaño del canvas cuando se redimensione la ventana
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    createStarfield();
    initMouseTrail();
});