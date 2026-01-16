
        // Sample texts for different difficulty levels
        const sampleTexts = {
            easy: [
                "The quick brown fox jumps over the lazy dog. This classic sentence contains every letter in the alphabet.",
                "Programming is fun and challenging. It requires logical thinking and problem solving skills.",
                "Typing practice can improve your speed and accuracy. Consistent practice is the key to success.",
                "Web development is an exciting field. HTML, CSS, and JavaScript are the core technologies.",
                "The sun rises in the east and sets in the west. This is a fundamental fact of our planet."
            ],
            medium: [
                "JavaScript is a versatile programming language that powers interactive features on millions of websites and applications across the internet.",
                "WebGL is a JavaScript API for rendering high-performance interactive 3D and 2D graphics within any compatible web browser.",
                "Responsive web design ensures that websites adapt to various screen sizes and devices, from mobile phones to desktop computers.",
                "Tailwind CSS is a utility-first CSS framework that enables rapid UI development with minimal custom CSS and consistent design systems.",
                "GSAP is a powerful JavaScript library for creating high-performance animations that work in all major browsers and devices."
            ],
            hard: [
                "Three.js simplifies WebGL programming by providing abstractions for 3D graphics, enabling developers to create complex scenes with less code while maintaining performance across different hardware configurations.",
                "The Event Loop is a fundamental concept in JavaScript's concurrency model, managing the execution of code, collecting and processing events, and executing queued sub-tasks through a continuous loop.",
                "Progressive Web Apps leverage modern web capabilities to deliver app-like experiences, including offline functionality, push notifications, and device hardware access, while remaining accessible through URLs.",
                "Typing speed and accuracy are critical skills in today's digital workforce, impacting productivity, communication efficiency, and overall computer literacy across various professional domains.",
                "WebAssembly enables near-native performance for web applications by allowing developers to compile code written in languages like C, C++, and Rust to run in the browser alongside JavaScript."
            ]
        };

        // Game state
        const gameState = {
            startTime: null,
            endTime: null,
            isRunning: false,
            isComplete: false,
            currentText: "",
            typedText: "",
            errors: 0,
            totalKeystrokes: 0,
            correctKeystrokes: 0,
            wpm: 0,
            accuracy: 100,
            timeLeft: 60,
            timer: null,
            difficulty: "medium",
            charPosition: 0
        };

        // DOM Elements
        const textDisplay = document.getElementById('text-display');
        const typingInput = document.getElementById('typing-input');
        const wpmElement = document.getElementById('wpm');
        const accuracyElement = document.getElementById('accuracy');
        const timeElement = document.getElementById('time');
        const errorsElement = document.getElementById('errors');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const wordCountElement = document.getElementById('word-count');
        const charCountElement = document.getElementById('char-count');
        const restartBtn = document.getElementById('restart-btn');
        const newTextBtn = document.getElementById('new-text-btn');
        const modeToggle = document.getElementById('mode-toggle');
        const textOptions = document.querySelectorAll('.text-option');
        const resultModal = document.getElementById('result-modal');
        const resultWpm = document.getElementById('result-wpm');
        const resultAccuracy = document.getElementById('result-accuracy');
        const resultErrors = document.getElementById('result-errors');
        const resultTime = document.getElementById('result-time');
        const closeModalBtn = document.getElementById('close-modal');
        const restartFromModalBtn = document.getElementById('restart-from-modal');
        const difficultyBadge = document.getElementById('difficulty-badge');

        // Initialize the typing test
        function initTypingTest() {
            // Select random text based on difficulty
            const texts = sampleTexts[gameState.difficulty];
            const randomIndex = Math.floor(Math.random() * texts.length);
            gameState.currentText = texts[randomIndex];
            
            // Reset game state
            gameState.startTime = null;
            gameState.endTime = null;
            gameState.isRunning = false;
            gameState.isComplete = false;
            gameState.typedText = "";
            gameState.errors = 0;
            gameState.totalKeystrokes = 0;
            gameState.correctKeystrokes = 0;
            gameState.wpm = 0;
            gameState.accuracy = 100;
            gameState.timeLeft = 60;
            gameState.charPosition = 0;
            
            // Clear input
            typingInput.value = "";
            typingInput.disabled = false;
            typingInput.focus();
            
            // Update UI
            updateTextDisplay();
            updateStats();
            updateProgress();
            
            // Update difficulty badge
            updateDifficultyBadge();
            
            // Clear timer if exists
            if (gameState.timer) {
                clearInterval(gameState.timer);
                gameState.timer = null;
            }
            
            // Start timer
            gameState.timer = setInterval(updateTimer, 1000);
            
            // Reset particle colors
            resetParticleColors();
            
            // Animation
            gsap.fromTo(".text-display", 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" }
            );
            
            gsap.fromTo(".stat-card", 
                { scale: 0.9, opacity: 0.5 }, 
                { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
            
            // Animate text display with typing effect
            gsap.fromTo("#text-display", 
                { opacity: 0, scale: 0.95 }, 
                { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
            );
            
            // Pulse animation for difficulty badge
            gsap.fromTo(".difficulty-badge", 
                { scale: 0.8, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
            );
            
            console.log(`Loaded ${gameState.difficulty} difficulty text: "${gameState.currentText.substring(0, 50)}..."`);
        }

        // Update the text display with color coding - FIXED BUG
        function updateTextDisplay() {
            let displayHTML = "";
            const typed = gameState.typedText;
            const current = gameState.currentText;
            
            for (let i = 0; i < current.length; i++) {
                let char = current[i];
                let charClass = "upcoming";
                
                if (i < typed.length) {
                    charClass = typed[i] === current[i] ? "correct typed" : "incorrect typed";
                } else if (i === typed.length) {
                    // This is the cursor position
                    charClass = "cursor text-indigo-500 dark:text-indigo-300";
                    char = `<span class="${charClass}">${char}</span>`;
                    displayHTML += char;
                    continue;
                }
                
                displayHTML += `<span class="${charClass}">${char}</span>`;
            }
            
            textDisplay.innerHTML = displayHTML;
            
            // Update word and character counts
            const wordCount = gameState.currentText.split(' ').length;
            const charCount = gameState.currentText.length;
            wordCountElement.textContent = wordCount;
            charCountElement.textContent = charCount;
            
            // Update character position
            gameState.charPosition = typed.length;
        }

        // Update difficulty badge
        function updateDifficultyBadge() {
            difficultyBadge.textContent = gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
            
            // Update badge color based on difficulty
            if (gameState.difficulty === "easy") {
                difficultyBadge.style.background = "linear-gradient(135deg, #10b981 0%, #34d399 100%)";
            } else if (gameState.difficulty === "medium") {
                difficultyBadge.style.background = "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)";
            } else {
                difficultyBadge.style.background = "linear-gradient(135deg, #ef4444 0%, #f87171 100%)";
            }
        }

        // Update statistics
        function updateStats() {
            // Calculate WPM (words per minute)
            if (gameState.startTime && gameState.isRunning) {
                const timeInMinutes = (Date.now() - gameState.startTime) / 60000;
                const words = gameState.typedText.trim().split(/\s+/).length;
                gameState.wpm = Math.round(words / Math.max(timeInMinutes, 0.0167)); // Prevent division by zero
            }
            
            // Calculate accuracy
            if (gameState.totalKeystrokes > 0) {
                gameState.accuracy = Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100);
            } else {
                gameState.accuracy = 100;
            }
            
            // Update UI
            wpmElement.textContent = gameState.wpm;
            accuracyElement.textContent = `${gameState.accuracy}%`;
            timeElement.textContent = `${gameState.timeLeft}s`;
            errorsElement.textContent = gameState.errors;
            
            // Color coding for accuracy
            if (gameState.accuracy >= 95) {
                accuracyElement.style.color = "#10b981";
            } else if (gameState.accuracy >= 85) {
                accuracyElement.style.color = "#f59e0b";
            } else {
                accuracyElement.style.color = "#ef4444";
            }
            
            // Color coding for time
            if (gameState.timeLeft <= 10) {
                timeElement.style.color = "#ef4444";
                timeElement.classList.add("timer-warning");
            } else if (gameState.timeLeft <= 20) {
                timeElement.style.color = "#f59e0b";
                timeElement.classList.remove("timer-warning");
            } else {
                timeElement.style.color = "#f59e0b";
                timeElement.classList.remove("timer-warning");
            }
            
            // Animate stat changes
            if (gameState.isRunning) {
                gsap.fromTo("#wpm", 
                    { scale: 1.2 }, 
                    { scale: 1, duration: 0.3, ease: "power2.out" }
                );
            }
        }

        // Update progress bar
        function updateProgress() {
            const progress = (gameState.typedText.length / gameState.currentText.length) * 100;
            const clampedProgress = Math.min(100, Math.max(0, progress));
            
            progressFill.style.width = `${clampedProgress}%`;
            progressText.textContent = `${Math.round(clampedProgress)}%`;
            
            // Change color based on accuracy
            if (gameState.accuracy >= 95) {
                progressFill.style.background = "linear-gradient(to right, #10b981, #3b82f6)";
            } else if (gameState.accuracy >= 85) {
                progressFill.style.background = "linear-gradient(to right, #f59e0b, #f97316)";
            } else {
                progressFill.style.background = "linear-gradient(to right, #ef4444, #ec4899)";
            }
        }

        // Update timer
        function updateTimer() {
            if (!gameState.isRunning || gameState.isComplete) return;
            
            gameState.timeLeft--;
            timeElement.textContent = `${gameState.timeLeft}s`;
            
            // Pulse animation when time is low
            if (gameState.timeLeft <= 5) {
                gsap.fromTo("#time", 
                    { scale: 1.3 }, 
                    { scale: 1, duration: 0.5, ease: "power2.out" }
                );
            }
            
            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }

        // End the game
        function endGame() {
            gameState.isComplete = true;
            gameState.isRunning = false;
            typingInput.disabled = true;
            
            clearInterval(gameState.timer);
            
            // Update result modal
            resultWpm.textContent = gameState.wpm;
            resultAccuracy.textContent = `${gameState.accuracy}%`;
            resultErrors.textContent = gameState.errors;
            resultTime.textContent = `${60 - gameState.timeLeft}s`;
            
            // Show modal after a short delay
            setTimeout(() => {
                resultModal.classList.add('active');
            }, 800);
            
            // Create celebration particles
            createCelebrationParticles();
            
            console.log("Game ended. Final stats:", {
                wpm: gameState.wpm,
                accuracy: gameState.accuracy,
                errors: gameState.errors,
                time: 60 - gameState.timeLeft
            });
        }

        // Handle typing input - FIXED BUG with backspace
        typingInput.addEventListener('input', function() {
            if (!gameState.isRunning) {
                gameState.isRunning = true;
                gameState.startTime = Date.now();
            }
            
            const newTypedText = this.value;
            
            // Handle backspace - don't count as a keystroke for accuracy
            if (newTypedText.length < gameState.typedText.length) {
                gameState.typedText = newTypedText;
                updateTextDisplay();
                updateProgress();
                return;
            }
            
            // New character typed
            gameState.typedText = newTypedText;
            gameState.totalKeystrokes++;
            
            // Check if the last character is correct
            const lastIndex = gameState.typedText.length - 1;
            if (lastIndex >= 0 && lastIndex < gameState.currentText.length) {
                if (gameState.typedText[lastIndex] === gameState.currentText[lastIndex]) {
                    gameState.correctKeystrokes++;
                    
                    // Create particle for correct keystroke
                    createParticle(0x10b981, 1.2);
                    
                    // Animate the correct character
                    const charElements = textDisplay.querySelectorAll('span');
                    if (charElements[lastIndex]) {
                        gsap.fromTo(charElements[lastIndex], 
                            { y: -8, opacity: 0 }, 
                            { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }
                        );
                    }
                } else {
                    gameState.errors++;
                    
                    // Create particle for incorrect keystroke
                    createParticle(0xef4444, 1.5);
                    
                    // Shake animation for incorrect character
                    const charElements = textDisplay.querySelectorAll('span');
                    if (charElements[lastIndex]) {
                        gsap.fromTo(charElements[lastIndex], 
                            { x: -5 }, 
                            { x: 5, duration: 0.1, yoyo: true, repeat: 1 }
                        );
                    }
                }
            }
            
            // Update UI
            updateTextDisplay();
            updateStats();
            updateProgress();
            
            // Check if text is complete
            if (gameState.typedText.length >= gameState.currentText.length) {
                endGame();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Tab to restart
            if (e.key === 'Tab' && !typingInput.matches(':focus')) {
                e.preventDefault();
                initTypingTest();
            }
            
            // Escape to pause/focus
            if (e.key === 'Escape') {
                if (typingInput.matches(':focus')) {
                    typingInput.blur();
                } else {
                    typingInput.focus();
                }
            }
            
            // Ctrl/Cmd + R to restart
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                initTypingTest();
            }
        });

        // Restart button
        restartBtn.addEventListener('click', function() {
            initTypingTest();
        });
        
        // New text button
        newTextBtn.addEventListener('click', function() {
            // Just load new text without changing difficulty
            const texts = sampleTexts[gameState.difficulty];
            const randomIndex = Math.floor(Math.random() * texts.length);
            gameState.currentText = texts[randomIndex];
            gameState.typedText = "";
            gameState.errors = 0;
            gameState.totalKeystrokes = 0;
            gameState.correctKeystrokes = 0;
            gameState.wpm = 0;
            gameState.accuracy = 100;
            gameState.timeLeft = 60;
            gameState.isRunning = false;
            gameState.isComplete = false;
            gameState.startTime = null;
            
            typingInput.value = "";
            typingInput.disabled = false;
            typingInput.focus();
            
            // Clear timer if exists
            if (gameState.timer) {
                clearInterval(gameState.timer);
                gameState.timer = null;
            }
            
            // Start timer
            gameState.timer = setInterval(updateTimer, 1000);
            
            updateTextDisplay();
            updateStats();
            updateProgress();
            
            console.log("New text loaded for", gameState.difficulty, "difficulty");
        });
        
        // Close modal button
        closeModalBtn.addEventListener('click', function() {
            resultModal.classList.remove('active');
        });
        
        // Restart from modal button
        restartFromModalBtn.addEventListener('click', function() {
            resultModal.classList.remove('active');
            setTimeout(initTypingTest, 300);
        });

        // Difficulty selector - FIXED BUG
        textOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                textOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
                // Update difficulty
                gameState.difficulty = this.dataset.difficulty;
                console.log("Difficulty changed to:", gameState.difficulty);
                // Restart with new difficulty
                initTypingTest();
            });
        });

        // Theme toggle
        modeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.contains('dark-mode');
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
            
            // Update WebGL particle colors based on theme
            updateParticleColorsForTheme();
            
            // Save theme preference
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'light') {
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
            }
        }

        // WebGL Particle System
        let scene, camera, renderer, particles;
        
        function initWebGL() {
            // Create scene
            scene = new THREE.Scene();
            
            // Create camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 40;
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);
            
            const container = document.getElementById('webgl-container');
            container.appendChild(renderer.domElement);
            
            // Create particles
            createParticles();
            
            // Handle window resize
            window.addEventListener('resize', onWindowResize);
            
            // Start animation loop
            animate();
        }
        
        function createParticles() {
            const particleCount = 300;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            
            // Create particles in a sphere
            for (let i = 0; i < particleCount * 3; i += 3) {
                const radius = 30;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = radius * Math.cos(phi);
                
                // Color based on position
                colors[i] = 0.5 + positions[i] / 60; // R
                colors[i + 1] = 0.5 + positions[i + 1] / 60; // G
                colors[i + 2] = 0.7 + positions[i + 2] / 60; // B
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const material = new THREE.PointsMaterial({
                size: 0.8,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            particles = new THREE.Points(geometry, material);
            scene.add(particles);
        }
        
        function createParticle(color, intensity) {
            if (!gameState.isRunning) return;
            
            const particleGeometry = new THREE.BufferGeometry();
            const particleMaterial = new THREE.PointsMaterial({
                size: 1.2 * intensity,
                color: color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            const positions = new Float32Array(3);
            positions[0] = (Math.random() - 0.5) * 30;
            positions[1] = (Math.random() - 0.5) * 20;
            positions[2] = (Math.random() - 0.5) * 20;
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particle = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particle);
            
            // Animate particle
            const targetY = positions[1] + 15;
            const targetX = positions[0] + (Math.random() - 0.5) * 15;
            
            gsap.to(particle.position, {
                y: targetY,
                x: targetX,
                duration: 1.5,
                ease: "power2.out",
                onComplete: () => {
                    scene.remove(particle);
                    particleGeometry.dispose();
                    particleMaterial.dispose();
                }
            });
            
            gsap.to(particle.material, {
                opacity: 0,
                duration: 1.5,
                ease: "power2.out"
            });
        }
        
        function createCelebrationParticles() {
            for (let i = 0; i < 80; i++) {
                setTimeout(() => {
                    const colors = [0x8b5cf6, 0x3b82f6, 0x10b981, 0xf59e0b];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    createParticle(randomColor, 2);
                }, i * 30);
            }
        }
        
        function resetParticleColors() {
            if (particles && particles.geometry.attributes.color) {
                const colors = particles.geometry.attributes.color.array;
                
                for (let i = 0; i < colors.length; i += 3) {
                    colors[i] = 0.5 + Math.random() * 0.3; // R
                    colors[i + 1] = 0.5 + Math.random() * 0.3; // G
                    colors[i + 2] = 0.6 + Math.random() * 0.4; // B
                }
                
                particles.geometry.attributes.color.needsUpdate = true;
            }
        }
        
        function updateParticleColorsForTheme() {
            if (!particles || !particles.geometry.attributes.color) return;
            
            const colors = particles.geometry.attributes.color.array;
            const isDark = document.body.classList.contains('dark-mode');
            
            for (let i = 0; i < colors.length; i += 3) {
                if (isDark) {
                    // Dark mode colors (more blue/purple)
                    colors[i] = 0.3 + Math.random() * 0.3; // R
                    colors[i + 1] = 0.3 + Math.random() * 0.4; // G
                    colors[i + 2] = 0.6 + Math.random() * 0.4; // B
                } else {
                    // Light mode colors (softer, warmer)
                    colors[i] = 0.6 + Math.random() * 0.3; // R
                    colors[i + 1] = 0.6 + Math.random() * 0.3; // G
                    colors[i + 2] = 0.7 + Math.random() * 0.3; // B
                }
            }
            
            particles.geometry.attributes.color.needsUpdate = true;
        }
        
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate particles
            if (particles) {
                particles.rotation.x += 0.001;
                particles.rotation.y += 0.002;
                
                // Pulse particles based on typing speed
                if (gameState.isRunning) {
                    const pulse = 0.6 + Math.sin(Date.now() * 0.005) * 0.2 * (gameState.wpm / 100);
                    particles.material.size = pulse;
                    
                    // Speed up rotation based on WPM
                    particles.rotation.y += 0.0005 * (gameState.wpm / 50);
                }
            }
            
            renderer.render(scene, camera);
        }
        
        // Initialize everything when page loads
        window.addEventListener('DOMContentLoaded', () => {
            initWebGL();
            initTypingTest();
            
            // GSAP intro animation
            gsap.from("header", { y: -40, opacity: 0, duration: 1, delay: 0.3 });
            gsap.from(".stat-card", { 
                y: 30, 
                opacity: 0, 
                duration: 0.8, 
                delay: 0.5,
                stagger: 0.1,
                ease: "back.out(1.2)"
            });
            gsap.from(".text-display", { 
                scale: 0.9, 
                opacity: 0, 
                duration: 0.8, 
                delay: 0.7,
                ease: "power3.out"
            });
            
            // Floating shapes animation
            gsap.to(".floating-shape", {
                y: "+=20",
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: {
                    amount: 1.5,
                    from: "random"
                }
            });
        });
