gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ----------------------------
// HERO VIDEO ANIMATION
// ----------------------------
const heroSection = document.querySelector("#hero");
const heroVideo = document.querySelector("#hero-video");
const heroRectEl = document.querySelector("#hero-rect");

if (heroSection && heroVideo && heroRectEl) {

    // Helper to get current rect
    const getRect = () => heroRectEl.getBoundingClientRect();

    gsap.fromTo(heroVideo,
        {
            left: () => getRect().left,
            top: () => getRect().top,
            width: () => getRect().width,
            height: () => getRect().height,
            borderRadius: "20px",
        },
        {
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            borderRadius: "0px", // Optional: smoothly remove radius
            ease: "none",
            aspectRatio: "auto",
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "+=50%",
                scrub: true,
                invalidateOnRefresh: true,
            },
        }
    );
}

// Ensure ScrollTrigger refreshes after load to catch correct positions
window.addEventListener("load", () => ScrollTrigger.refresh());

// ----------------------------
// HERO 3D TILT EFFECT
// ----------------------------
const heroClipContainer = document.querySelector(".hero-clip-wrapper");
const tiltState = { intensity: 1 }; // State to control tilt strength

if (heroSection && heroVideo && heroClipContainer) {

    // Dampen tilt as user scrolls down
    ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "+=50%",
        scrub: true,
        onUpdate: (self) => {
            tiltState.intensity = 1 - self.progress;
        }
    });

    // Optimize with quickTo for performance
    const clipRotTo = gsap.quickTo(heroClipContainer, "rotation", { duration: 0.5, ease: "power1.out" });
    const vidRotYTo = gsap.quickTo(heroVideo, "rotationY", { duration: 0.5, ease: "power1.out" });
    const vidRotXTo = gsap.quickTo(heroVideo, "rotationX", { duration: 0.5, ease: "power1.out" });

    // Set initial properties for acceleration
    gsap.set([heroClipContainer, heroVideo], { transformPerspective: 1000, transformOrigin: "center center", force3D: true });

    window.addEventListener("mousemove", (e) => {
        if (tiltState.intensity <= 0.01) return; // Skip if intensity is negligible

        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;
        const intensity = tiltState.intensity;

        // Animate Clip Container (Tilt A) - Only Rotation needs continuous update
        clipRotTo(xPos * 10 * intensity);

        // Ensure scale is maintained (could be moved to Enter/Leave if strictly hover, but this is window level)
        // We'll trust CSS or simple tween for scale to avoid thrashing, or just include it if needed. 
        // Original code had scale: 1.03. We'll set it once or let the mouse interaction handle it subtly.

        // Animate Video Element (Tilt B - Opposite Direction)
        vidRotYTo(-xPos * 10 * intensity);
        vidRotXTo(yPos * 10 * intensity);
    });
}
// ----------------------------
// OVERVIEW TEXT ANIMATION
// ----------------------------
const maskingImage = document.querySelector("#masking-image");
const overviewTexts = document.querySelectorAll("#highlights .container h2, #highlights .carousel-caption > *");

if (maskingImage && overviewTexts.length > 0) {
    gsap.from(overviewTexts, {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: maskingImage,
            start: "bottom center", // When bottom of mask hits top of viewport
            toggleActions: "play none none reverse"
        }
    });
}
// ----------------------------
// BLUEPRINT SCROLL INTERACTION
// ----------------------------
const blueprintItems = document.querySelectorAll(".blueprint-item");
const blueprintIcons = document.querySelectorAll(".blueprint-icon");

if (blueprintItems.length > 0 && blueprintIcons.length > 0) {
    // Initial state: hide all icons, show first
    gsap.set(blueprintIcons, { autoAlpha: 0, scale: 0.8 });
    gsap.set(blueprintIcons[0], { autoAlpha: 1, scale: 1 });
    blueprintItems[0].classList.add('active');

    let currentActiveIndex = 0;
    const stickyPosition = window.innerHeight * 0.4; // 40vh sticky position

    // Create a single ScrollTrigger that continuously monitors scroll position
    ScrollTrigger.create({
        trigger: ".blueprint-list",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            // Find which item is closest to the sticky position
            let closestIndex = 0;
            let closestDistance = Infinity;

            blueprintItems.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const distance = Math.abs(itemCenter - stickyPosition);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            // Only update if the active item has changed
            if (closestIndex !== currentActiveIndex) {
                currentActiveIndex = closestIndex;
                updateBlueprintState(closestIndex);
            }
        }
    });

    function updateBlueprintState(activeIndex) {
        // Animate Icons
        blueprintIcons.forEach((icon, i) => {
            if (i === activeIndex) {
                gsap.to(icon, { autoAlpha: 1, scale: 3, duration: 0.6, ease: "power2.out", overwrite: true });
            } else {
                gsap.to(icon, { autoAlpha: 0, scale: 0.8, duration: 0.4, ease: "power2.out", overwrite: true });
            }
        });

        // Toggle Active Class
        blueprintItems.forEach((item, i) => {
            if (i === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}
// ----------------------------
// PILLARS STACK ANIMATION
// ----------------------------
const stackCards = document.querySelectorAll(".stack-card");

if (stackCards.length > 0) {
    stackCards.forEach((card, index) => {
        // ENTRANCE ANIMATION (Curtain Reveal)
        const imgWrapper = card.querySelector(".ratio");
        const img = card.querySelector("img");

        if (imgWrapper && img) {
            // Initial states
            // Clip from right to left (Curtain opens left to right?)
            // Let's do a center-out reveal or simple wipe.
            // Simple wipe from bottom: inset(0 0 100% 0) -> inset(0 0 0% 0)

            // Set initial state immediately to avoid flashing
            gsap.set(imgWrapper, { clipPath: "inset(0 0 100% 0)" });
            gsap.set(img, { scale: 1.4 });

            gsap.to(imgWrapper, {
                clipPath: "inset(0 0 0% 0)",
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 60%", // Delayed: When card top hits 60% of viewport
                    end: "top 40%",
                    toggleActions: "play none none reverse"
                }
            });

            gsap.to(img, {
                scale: 1,
                duration: 1.4,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 60%", // Match above
                    toggleActions: "play none none reverse"
                }
            });
        }

        // EXIT ANIMATION (Stacking Effect)
        // We only animate the card if there is a next card to cover it
        // The last card just stays sticky or scrolls up naturally
        if (index < stackCards.length - 1) {
            const nextCard = stackCards[index + 1];

            // Calculate tilt direction: odd index = left (-5deg), even = right (5deg) 
            // Note: index 0 is first card, so even index (0, 2) tilts one way, odd (1, 3) tilts other
            const rotation = index % 2 === 0 ? -5 : 5;

            gsap.to(card, {
                scale: 0.9,
                opacity: 0,
                rotation: rotation,
                transformOrigin: "center top",
                ease: "none",
                scrollTrigger: {
                    trigger: nextCard,
                    start: "top top+=400px", // Start when next card is 400px from top
                    end: "top top-=100px", // End when next card is 100px past top (gives ~500px animation window)
                    scrub: true,
                    // markers: true 
                }
            });
        }
    });
}

// ----------------------------
// AWARDS REVEAL ANIMATION
// ----------------------------
const awardsSection = document.querySelector("#awards");
const awardsOverlay = document.querySelector("#awards-overlay");
const jawUpper = document.querySelector(".jaw-upper");
const jawLower = document.querySelector(".jaw-lower");

if (awardsSection && jawUpper && jawLower) {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: awardsSection,
            start: "center bottom", // Starts when top of awards hits bottom of viewport
            end: "center top-=200", // Ends when center of awards hits center of viewport
            scrub: 1,
            // markers: true
        }
    });

    // 1. Expand Height from 0 to auto (approx 100vh or intrinsic height)
    // using max-height for smooth transition from 0 
    tl.to(awardsSection, {
        maxHeight: "150vh", // Use a value large enough to fit content
        minHeight: "100vh",
        duration: 5,
        ease: "power1.inOut",
        onUpdate: () => ScrollTrigger.refresh() // Recalculate layout continuously as height changes
    })
        // 2. Open the Jaws (Pacman Reveal)
        .to([jawUpper], {
            rotation: -90, // Rotate up-left
            // autoAlpha: 0, // Keep opacity full to see the "red" jaws rotate out
            duration: 10,
            // delay: 1,
            ease: "power1.inOut"
        }, "<") // Start simultaneously with height expansion
        .to([jawLower], {
            rotation: 90, // Rotate down-left
            // autoAlpha: 0,
            duration: 10,
            // delay: 1,
            ease: "power1.inOut"
        }, "<");
}

// ----------------------------
// IMPACT SECTION INTERACTION
// ----------------------------
const impactSection = document.querySelector("#impact");
const impactItems = document.querySelectorAll(".impact-image-item");
const impactTitle = document.querySelector(".impact-dynamic-title");
const impactText = document.querySelector(".impact-dynamic-text");

if (impactSection && impactItems.length > 0 && impactTitle && impactText) {

    impactItems.forEach((item, index) => {
        const overlay = item.querySelector(".impact-overlay");
        const numberEl = item.querySelector(".impact-number");

        // Get data from hidden source
        const dataSource = item.querySelector(".impact-data-source");
        const titleData = dataSource ? dataSource.querySelector(".data-title").innerText : "";
        const textData = dataSource ? dataSource.querySelector(".data-text").innerText : "";

        ScrollTrigger.create({
            trigger: item,
            start: "top center+=100", // Activate when item hits center-ish
            end: "bottom center+=100",
            onEnter: () => updateImpactState(item, titleData, textData),
            onEnterBack: () => updateImpactState(item, titleData, textData),
            onLeave: () => hideOverlay(item),
            onLeaveBack: () => hideOverlay(item),
            invalidateOnRefresh: true // Recalculate positions if page resizes or previous triggers refresh
        });
    });

    function updateImpactState(activeItem, title, text) {
        // Update Sticky Text with a quick fade transition
        // Fade Out
        gsap.to([impactTitle, impactText], {
            opacity: 0,
            duration: 0.15,
            onComplete: () => {
                // Change Text
                impactTitle.innerText = title;
                impactText.innerText = text;
                // Fade In
                gsap.to([impactTitle, impactText], { opacity: 1, duration: 0.15 });
            }
        });

        // Show Overlay on Active Image
        const overlay = activeItem.querySelector(".impact-overlay");
        const number = activeItem.querySelector(".impact-number");

        if (overlay && number) {
            gsap.to(overlay, { opacity: 1, duration: 0.3 });
            gsap.fromTo(number,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }

    function hideOverlay(item) {
        const overlay = item.querySelector(".impact-overlay");
        if (overlay) {
            gsap.to(overlay, { opacity: 0, duration: 0.3 });
        }
    }
}

// ----------------------------
// RETROSPECTIVE CARDS INTERACTION
// ----------------------------
const retroCards = document.querySelectorAll(".retrospective-card");

if (retroCards.length > 0) {
    retroCards.forEach((card) => {
        const gooeyBg = card.querySelector(".gooey-bg");
        const heading = card.querySelector("h4");

        if (gooeyBg && heading) {
            // Calculate initial "Dot" position (to the left of the heading)
            // We can't rely solely on offsetLeft if layout shifts, but for now we'll grab it once.
            // Better to compute on hover-out or use a relative offset.

            // Assuming p-5 (3rem = ~48px). We place dot slightly left of text start.
            // Let's position it dynamically based on the heading's actual position
            const updateDotPosition = () => {
                const hRect = heading.getBoundingClientRect();
                const cRect = card.getBoundingClientRect();
                // Position: Left of text, vertically centered on the first line (approx)
                return {
                    x: (hRect.left - cRect.left) - 25, // 25px left of the heading text
                    y: (hRect.top - cRect.top) + (hRect.height / 2) // Center vertically relative to heading block
                };
            };

            // Initial Set
            let dotPos = updateDotPosition();
            gsap.set(gooeyBg, {
                left: dotPos.x,
                top: dotPos.y,
                scale: 0.04, // Small dot (approx 32px if base is 800px)
                height: 500, // Card size cover
                width: 500,
                xPercent: -50, // Center the div on the coordinate
                yPercent: -50,
                opacity: 1
            });

            // Mouse Enter: Expand Ball & Center
            card.addEventListener("mouseenter", () => {
                const rect = card.getBoundingClientRect();
                gsap.to(gooeyBg, {
                    scale: 1,
                    left: rect.width / 2,
                    top: rect.height / 2,
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: true // Ensure we override any ongoing mousemove/leave tweens
                });
            });

            // Mouse Leave: Shrink Ball back to Dot position
            card.addEventListener("mouseleave", () => {
                dotPos = updateDotPosition(); // Re-calc in case of resize/scroll shifts
                gsap.to(gooeyBg, {
                    scale: 0.04,
                    left: dotPos.x,
                    top: dotPos.y,
                    duration: 0.5,
                    ease: "power3.inOut",
                    overwrite: true
                });
            });

            // Mouse Move: Track Cursor with damping (Parallax effect)
            // Use slower duration for "stickiness" feel
            const xTo = gsap.quickTo ? gsap.quickTo(gooeyBg, "left", { duration: 0.8, ease: "power3" }) : null;
            const yTo = gsap.quickTo ? gsap.quickTo(gooeyBg, "top", { duration: 0.8, ease: "power3" }) : null;

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Move only 10% towards the mouse position from center to create "sticky center" effect
                const targetX = centerX + (mouseX - centerX) * 0.1;
                const targetY = centerY + (mouseY - centerY) * 0.1;

                if (xTo && yTo) {
                    xTo(targetX);
                    yTo(targetY);
                } else {
                    gsap.to(gooeyBg, {
                        left: targetX,
                        top: targetY,
                        duration: 0.8,
                        ease: "power3",
                        overwrite: "auto"
                    });
                }
            });

            // Handle Resize to keep dot in place
            window.addEventListener('resize', () => {
                dotPos = updateDotPosition();
                // Only reset if not currently hovering? 
                // For simplicity, we just update the stored pos, mouseleave will catch it.
                // If we are NOT hovering, we should snap it.
                if (!card.matches(':hover')) {
                    gsap.set(gooeyBg, { left: dotPos.x, top: dotPos.y });
                }
            });
        }
    });
}


// ----------------------------
// ROADSHOW SECTION INTERACTION
// ----------------------------
const roadshowItems = document.querySelectorAll('.roadshow-item');
const roadshowImages = document.querySelectorAll('.roadshow-img');

if (roadshowItems.length > 0 && roadshowImages.length > 0) {
    // Set initial state
    gsap.set(roadshowImages, { opacity: 0, scale: 1.1 });

    let currentActiveRoadshow = null;
    const stickyImageTop = 150; // Sticky position from CSS (top: 150px)

    // Create a single ScrollTrigger that continuously monitors scroll position
    ScrollTrigger.create({
        trigger: ".roadshow-list",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            // Find which item is closest to the sticky image position
            let closestTarget = null;
            let closestDistance = Infinity;

            roadshowItems.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const distance = Math.abs(itemCenter - (window.innerHeight / 2));

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestTarget = item.getAttribute('data-target');
                }
            });

            // Only update if the active item has changed
            if (closestTarget && closestTarget !== currentActiveRoadshow) {
                currentActiveRoadshow = closestTarget;
                updateRoadshowState(closestTarget);
            }
        }
    });

    function updateRoadshowState(targetId) {
        // 1. Highlight List Item
        roadshowItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 2. Show Image
        const activeImg = document.querySelector(`.roadshow-img[data-city="${targetId}"]`);

        if (activeImg) {
            // Animate others out
            roadshowImages.forEach(img => {
                if (img !== activeImg) {
                    gsap.to(img, { opacity: 0, scale: 1.1, duration: 0.4, ease: "power2.out", overwrite: true });
                }
            });

            // Animate active in with smooth scale
            gsap.to(activeImg, {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                overwrite: true
            });
        }
    }
}


// ----------------------------
// GENERIC 3D TILT INTERACTION (SECTION BASED)
// ----------------------------
function addSectionTiltEffect(sectionSelector, targetSelector, intensity = 20) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const targets = section.querySelectorAll(targetSelector);
    if (targets.length === 0) return;

    // Setup initial Transform Perspective on targets
    targets.forEach(el => {
        gsap.set(el, { transformPerspective: 1000, transformStyle: "preserve-3d" });
    });

    // We'll store quickTo functions for each element to ensure performance
    // Map: element -> { xTo, yTo }
    const animations = new Map();
    targets.forEach(el => {
        animations.set(el, {
            xTo: gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" }),
            yTo: gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" })
        });
    });

    section.addEventListener("mousemove", (e) => {
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Check if element is in viewport roughly to avoid calc on off-screen elements? 
            // For now, just calc all.

            const width = rect.width;
            const height = rect.height;

            // Mouse relative to the Element Center
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate -1 to 1 range relative to element dimensions
            // Valid even if mouse is outside the element (will be > 1 or < -1)
            const xPct = (mouseX / width - 0.5) * 2;
            const yPct = (mouseY / height - 0.5) * 2;

            // Apply Tilt
            // Distance attenuation? (Optional: Clamp or reduce intensity if far away)
            // For now, linear tilt based on position relative to card center.
            const anim = animations.get(el);
            if (anim) {
                anim.xTo(xPct * intensity);
                anim.yTo(-yPct * intensity);
            }
        });
    });

    section.addEventListener("mouseleave", () => {
        targets.forEach(el => {
            const anim = animations.get(el);
            if (anim) {
                anim.xTo(0);
                anim.yTo(0);
            }
        });
    });
}

// Apply to requested sections
// 1. Roadshow Images
addSectionTiltEffect("#roadshows", "#roadshow-image-container", 5);

// 2. Momentum Images
addSectionTiltEffect("#impact", ".impact-img-wrapper", 5);



// ----------------------------
// UNIVERSAL TEXT REVEAL ANIMATION (CLIP REVEAL)
// ----------------------------
// Selects headings and paragraphs to apply a "masked slide-up" effect

// We need to wait for DOM to be ready and potentially layout to settle
window.addEventListener("load", () => {
    // Select elements - be careful not to break specific components
    const revealElements = document.querySelectorAll("section h1, section h2, section h3, section h4, section h5, section h6, section p.lead");

    // Valid elements to animate
    const itemsToAnimate = [];

    revealElements.forEach(el => {
        // Skip conditionals
        if (el.closest('#hero') || el.closest('.carousel-caption') || el.closest('.stack-card') ||
            el.closest('.nav') || el.classList.contains('no-reveal') || el.classList.contains('impact-number')) return;

        const originalText = el.innerText;
        if (!originalText.trim()) return;

        // Create a wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-wrapper'; // Use class for potentially cleaner DOM
        Object.assign(wrapper.style, {
            overflow: 'hidden',
            display: 'block',
            margin: '0',
            padding: '0'
        });

        const inner = document.createElement('div');
        inner.className = 'text-reveal-inner';
        inner.style.display = 'block';
        // Optimize: promote to layer
        inner.style.willChange = 'transform, opacity';

        // Move children
        while (el.firstChild) {
            inner.appendChild(el.firstChild);
        }

        wrapper.appendChild(inner);
        el.appendChild(wrapper);

        // Prep animation state
        gsap.set(inner, { y: "100%", opacity: 0 });
        itemsToAnimate.push(inner);
    });

    // Use Batch for performance (creates fewer ScrollTriggers)
    ScrollTrigger.batch(itemsToAnimate, {
        start: "top 85%",
        once: true,
        onEnter: batch => {
            gsap.to(batch, {
                y: "0%",
                opacity: 1,
                duration: 1.0,
                ease: "power4.out",
                stagger: 0.05,
                overwrite: true,
                force3D: true
            });
        }
    });
});

// ----------------------------
// NAVBAR GLASS TOGGLE
// ----------------------------
const navbar = document.querySelector(".navbar");

if (navbar) {
    ScrollTrigger.create({
        start: "top top",
        end: 99999, // Run indefinitely
        onUpdate: (self) => {
            // "Half section" logic: Approx 50vh or just entering the next content.
            // Let's use 50vh as a reasonable "half section" threshold.
            if (self.scroll() > window.innerHeight / 2) {
                if (!navbar.classList.contains("glass")) {
                    navbar.classList.add("glass");
                }
            } else {
                if (navbar.classList.contains("glass")) {
                    navbar.classList.remove("glass");
                }
            }
        }
    });
}


// ----------------------------
// SMOOTH ANCHOR SCROLLING
// ----------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Use Lenis for smooth scroll if available, otherwise fallback
            if (typeof lenis !== 'undefined' && lenis) {
                lenis.scrollTo(targetElement);
            } else {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});
