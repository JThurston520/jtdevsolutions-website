// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function addCircuitAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let animationFrameId;
    let isAnimating = false;

    const startAnimation = () => {
        if (isAnimating) return;
        isAnimating = true;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.2;
            pointer-events: none;
        `;
        
        element.appendChild(canvas);
        
        const ctx = canvas.getContext('2d', { alpha: true });
        const updateCanvasSize = () => {
            const rect = element.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        updateCanvasSize();

        // Optimized parameters
        const gridSize = Math.max(30, Math.floor(canvas.width / 20));
        const nodes = [];
        const connections = [];

        // Create grid efficiently
        for(let x = 0; x < canvas.width; x += gridSize) {
            for(let y = 0; y < canvas.height; y += gridSize) {
                if(Math.random() > 0.5) {
                    nodes.push({x, y});
                }
            }
        }

        // Optimize connections creation
        const maxConnections = Math.min(nodes.length, 50);
        for(let i = 0; i < maxConnections; i++) {
            const node = nodes[i];
            const nearNodes = nodes.filter(other => 
                Math.abs(other.x - node.x) <= gridSize && 
                Math.abs(other.y - node.y) <= gridSize &&
                other !== node
            ).slice(0, 3);

            if(nearNodes.length) {
                const target = nearNodes[Math.floor(Math.random() * nearNodes.length)];
                connections.push({
                    start: node,
                    end: target,
                    progress: Math.random(),
                    speed: 0.003 + Math.random() * 0.004
                });
            }
        }

        function animate() {
            if (!isAnimating) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Batch drawing operations
            ctx.beginPath();
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            
            connections.forEach(conn => {
                ctx.moveTo(conn.start.x, conn.start.y);
                ctx.lineTo(conn.end.x, conn.end.y);
            });
            ctx.stroke();
            
            // Batch node drawing
            ctx.beginPath();
            ctx.fillStyle = '#FF6600';
            nodes.forEach(node => {
                ctx.moveTo(node.x, node.y);
                ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            });
            ctx.fill();
            
            // Optimize pulse animation
            ctx.strokeStyle = '#FFA500';
            connections.forEach(conn => {
                const x = conn.start.x + (conn.end.x - conn.start.x) * conn.progress;
                const y = conn.start.y + (conn.end.y - conn.start.y) * conn.progress;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.stroke();
                
                conn.progress += conn.speed;
                if(conn.progress > 1) conn.progress = 0;
            });
            
            animationFrameId = requestAnimationFrame(animate);
        }

        // Handle resize efficiently
        const handleResize = debounce(() => {
            updateCanvasSize();
        }, 250);

        window.addEventListener('resize', handleResize);
        animate();
    };

    const stopAnimation = () => {
        isAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        const canvas = element.querySelector('canvas');
        if(canvas) {
            canvas.remove();
        }
    };

    element.addEventListener('mouseenter', startAnimation);
    element.addEventListener('mouseleave', stopAnimation);
}

// Form validation and security
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', validateForm);
}

function validateForm(event) {
    event.preventDefault();
    
    if (!window.DOMPurify) {
        console.error('DOMPurify is required for form validation');
        return false;
    }
    
    const formData = new FormData(event.target);
    const sanitizedData = {};
    
    for (let [key, value] of formData.entries()) {
        sanitizedData[key] = DOMPurify.sanitize(value.trim());
    }
    
    if (!isValidInput(sanitizedData)) {
        alert('Please check your input and try again');
        return false;
    }
    
    if (isRateLimited()) {
        alert('Please wait before submitting again');
        return false;
    }
    
    event.target.submit();
}

function isValidInput(data) {
    const suspiciousPatterns = /[<>{}]/g;
    return !Object.values(data).some(value => suspiciousPatterns.test(value));
}

// Rate limiting with localStorage
function isRateLimited() {
    const now = Date.now();
    const timeWindow = 60000;
    const maxSubmissions = 3;
    
    let submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    submissions = submissions.filter(time => time > now - timeWindow);
    
    if (submissions.length >= maxSubmissions) {
        return true;
    }
    
    submissions.push(now);
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    return false;
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    ['meetme', 'about', 'services-heading', 'pricing', 'contact']
        .forEach(id => addCircuitAnimation(id));
});