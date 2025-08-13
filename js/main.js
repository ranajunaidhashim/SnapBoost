        // Main JavaScript - Intersection Observer & Animations
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Intersection Observer for reveal animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, observerOptions);

            // Observe all reveal elements
            document.querySelectorAll('.reveal-element').forEach(el => {
                observer.observe(el);
            });

            // Counter animation for achievements
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.achievement-number').forEach(counter => {
                counterObserver.observe(counter);
            });

            function animateCounter(element) {
                const target = parseInt(element.getAttribute('data-target'));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.floor(current).toLocaleString();
                }, 16);
            }

            // 3D tilt effect for service cards
            document.querySelectorAll('.tilt-card').forEach(card => {
                card.style.willChange = 'transform';
                card.addEventListener('mousemove', handleTilt);
                card.addEventListener('mouseleave', resetTilt);
            });

            function handleTilt(e) {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            }

            function resetTilt(e) {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            }

            // Header scroll effect
            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const header = document.getElementById('header');
                const currentScrollY = window.scrollY;

                if (currentScrollY > 100) {
                    header.style.background = 'rgba(26, 26, 29, 0.3)';
                    header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                } else {
                    header.style.background = 'rgba(26, 26, 29, 0.326)';
                    header.style.boxShadow = 'none';
                }

                // Hide/show header on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                lastScrollY = currentScrollY;
            });

            // Mobile menu toggle
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const navLinks = document.querySelector('.nav-links');

            if (mobileToggle && navLinks) {
                mobileToggle.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                    mobileToggle.classList.toggle('active');
                });
            }

            // Particle animation for hero background
            createParticles();

            function createParticles() {
                const hero = document.querySelector('.hero-section');
                const particleCount = 20;

                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.cssText = `
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(255, 252, 0, 0.3);
                        border-radius: 50%;
                        pointer-events: none;
                        animation: particleFloat ${5 + Math.random() * 10}s linear infinite;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                        animation-delay: ${Math.random() * 5}s;
                    `;
                    hero.appendChild(particle);
                }
            }

            // Add particle animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        transform: translateY(100vh) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
                        opacity: 0;
                    }
                }

                .nav-links.active {
                    display: flex;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(26, 26, 29, 0.95);
                    backdrop-filter: blur(20px);
                    flex-direction: column;
                    padding: 2rem;
                    border-radius: 0 0 20px 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-top: none;
                }

                .mobile-menu-toggle.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }

                .mobile-menu-toggle.active span:nth-child(2) {
                    opacity: 0;
                }

                .mobile-menu-toggle.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }

                @media (min-width: 769px) {
                    .nav-links {
                        display: flex !important;
                    }
                }
            `;
            document.head.appendChild(style);

            // Scroll-triggered animations for floating elements
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;

                document.querySelectorAll('.floating-emoji').forEach((emoji, index) => {
                    const speed = (index + 1) * 0.3;
                    emoji.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
                });
            });

            // Enhanced button interactions
            document.querySelectorAll('.btn-primary').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    // Create ripple effect
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.4);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                    `;

                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);

                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });

            // Add ripple animation
            const rippleStyle = document.createElement('style');
            rippleStyle.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(rippleStyle);

            // Performance optimization: Throttle scroll events
            let ticking = false;

            function requestTick() {
                if (!ticking) {
                    requestAnimationFrame(updateAnimations);
                    ticking = true;
                }
            }

            function updateAnimations() {
                // Update scroll-based animations here
                ticking = false;
            }

            window.addEventListener('scroll', requestTick);

            // Preload critical images
            const criticalImages = [
                '/assets/logo.svg',
                '/assets/about.avif'
            ];

            criticalImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });

            console.log('🚀 SnapBoost landing page loaded successfully!');
        });

        
        // Graceful degradation for no-JS users
        document.documentElement.classList.add('js-enabled');
