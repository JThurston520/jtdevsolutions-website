function addCircuitAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.addEventListener('mouseenter', function() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.2';

        this.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = this.offsetWidth;
        canvas.height = this.offsetHeight;

        // Circuit parameters
        const gridSize = 30;
        const nodes = [];
        const connections = [];

        // Create grid of nodes
        for(let x = 0; x < canvas.width; x += gridSize) {
            for(let y = 0; y < canvas.height; y += gridSize) {
                if(Math.random() > 0.5) {
                    nodes.push({x, y});
                }
            }
        }

        // Create connections
        nodes.forEach(node => {
            const nearNodes = nodes.filter(other => 
                (Math.abs(other.x - node.x) <= gridSize && Math.abs(other.y - node.y) <= gridSize) &&
                (other.x !== node.x || other.y !== node.y)
            );
            if(nearNodes.length) {
                const target = nearNodes[Math.floor(Math.random() * nearNodes.length)];
                connections.push({start: node, end: target, progress: 0});
            }
        });

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            connections.forEach(conn => {
                ctx.beginPath();
                ctx.moveTo(conn.start.x, conn.start.y);
                ctx.lineTo(conn.end.x, conn.end.y);
                ctx.stroke();
            });

            // Draw nodes
            ctx.fillStyle = '#FF6600';
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Animate pulses
            ctx.strokeStyle = '#FFA500';
            connections.forEach(conn => {
                const x = conn.start.x + (conn.end.x - conn.start.x) * conn.progress;
                const y = conn.start.y + (conn.end.y - conn.start.y) * conn.progress;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.stroke();

                conn.progress += 0.005;
                if(conn.progress > 1) conn.progress = 0;
            });

            requestAnimationFrame(animate);
        }

        animate();
    });

    element.addEventListener('mouseleave', function() {
        const canvas = this.querySelector('canvas');
        if(canvas) {
            canvas.remove();
        }
    });
}

// Apply the animation to both elements
addCircuitAnimation('meetme');
addCircuitAnimation('about');
addCircuitAnimation('services');
addCircuitAnimation('pricing');
addCircuitAnimation('contact');

// Form Security
function validateForm(event) {
    event.preventDefault();
    
    // Sanitize inputs
    const name = DOMPurify.sanitize(document.getElementById('name').value);
    const email = DOMPurify.sanitize(document.getElementById('email').value);
    const message = DOMPurify.sanitize(document.getElementById('message').value);   
    
    // Basic validation
    if (!email.includes('@') || suspiciousPatterns.test(message)) {
    alert('Please enter valid inputs');
    return false;
}

    // Check for suspicious patterns
    const suspiciousPatterns = /[<>{}]/g;
    if (suspiciousPatterns.test(name)) {
        alert('Please enter a valid name');
        return false;
    }
    
    // Rate limiting
    // if (isRateLimited()) {
    //     alert('Please wait before submitting again');
    //     return false;
    // }

    // Debounce submission to prevent multiple clicks
    let debounceTimer;
function debounceSubmit(fn, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, delay);
}
    // Attach the debounced submit handler
    form.addEventListener('submit', (e) => {
    debounceSubmit(() => validateForm(e), 500);
});

    // If all checks pass
    document.getElementById('contact-form').submit();
}

// Rate limiting function
const submissionTimes = [];

function isRateLimited() {
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    const maxSubmissions = 3;
    
    // Remove old submissions
    while (submissionTimes.length > 0 && submissionTimes[0] < now - timeWindow) {
        submissionTimes.shift();
    }
    
    // Check if too many submissions
    if (submissionTimes.length >= maxSubmissions) {
        return true;
    }
    
    // Add current submission time
    submissionTimes.push(now);
    return false;
}

// Form validation and submission
function validateForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);

    // Basic validation
    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    
    if (name === '' || email === '') {
        alert('Please fill in all required fields');
        return false;
    }

    // Check rate limiting
    if (isRateLimited()) {
        alert('Please wait a moment before submitting again');
        return false;
    }

    // Submit the form
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert('Message sent successfully!');
            form.reset();
        } else {
            alert('Error sending message. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending message. Please try again.');
    });

    return false;
}