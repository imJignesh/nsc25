gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
const heroClipContainer = document.querySelector(".hero-clip-container");
const tiltState = { intensity: 1 }; // State to control tilt strength

if (heroSection && heroVideo && heroClipContainer) {

    // Dampen tilt as user scrolls down
    ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "+=50%",
        scrub: true,
        onUpdate: (self) => {
            // self.progress goes from 0 to 1. We want intensity 1 to 0.
            tiltState.intensity = 1 - self.progress;
        }
    });

    window.addEventListener("mousemove", (e) => {
        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;

        // Animate Clip Container (Tilt A)
        gsap.to(heroClipContainer, {
            rotation: xPos * 10 * tiltState.intensity,  // Multiply by intensity
            scale: 1.03, // Inverted Y axis for natural feel
            transformPerspective: 1000,
            transformOrigin: "center center",
            ease: "power1.out",
            duration: 0.5
        });

        // Animate Video Element (Tilt B - Opposite Direction)
        gsap.to(heroVideo, {
            rotationY: -xPos * 10 * tiltState.intensity, // Multiply by intensity
            rotationX: yPos * 10 * tiltState.intensity,
            transformPerspective: 1000,
            transformOrigin: "center center",
            ease: "power1.out",
            duration: 0.5
        });
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
            start: "bottom top", // When bottom of mask hits top of viewport
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
    // Initial state: hide all except first (ScrollTrigger will update if needed)
    gsap.set(blueprintIcons, { autoAlpha: 0, scale: 0.8 });
    gsap.set(blueprintIcons[0], { autoAlpha: 1, scale: 1 });
    gsap.set(blueprintItems[0], { opacity: 1, background: "#f8f9fa" });

    blueprintItems.forEach((item, index) => {
        ScrollTrigger.create({
            trigger: item,
            start: "top 60%", // Trigger when item top hits 60% of viewport height
            end: "bottom 60%",
            onEnter: () => updateBlueprintState(index),
            onEnterBack: () => updateBlueprintState(index),
        });
    });

    function updateBlueprintState(activeIndex) {
        // Animate Icons
        blueprintIcons.forEach((icon, i) => {
            if (i === activeIndex) {
                // Smooth entry
                gsap.to(icon, { autoAlpha: 1, scale: 3, duration: 0.6, ease: "power2.out", overwrite: true });
            } else {
                // Smooth exit
                gsap.to(icon, { autoAlpha: 0, scale: 0.8, duration: 0.4, ease: "power2.out", overwrite: true });
            }
        });

        // Animate List Items
        blueprintItems.forEach((item, i) => {
            if (i === activeIndex) {
                gsap.to(item, { opacity: 1, backgroundColor: "#f8f9fa", scale: 1.02, duration: 0.3, overwrite: true });
            } else {
                gsap.to(item, { opacity: 0.5, backgroundColor: "#ffffff", scale: 1, duration: 0.3, overwrite: true });
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
                    start: "top bottom", // When top of next card hits bottom of viewport 
                    end: "top top+=200", // When next card is well into view (adjustable)
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
        duration: 2.5,
        ease: "power1.inOut",
        onUpdate: () => ScrollTrigger.refresh() // Recalculate layout continuously as height changes
    })
        // 2. Open the Jaws (Pacman Reveal)
        .to([jawUpper], {
            rotation: -90, // Rotate up-left
            // autoAlpha: 0, // Keep opacity full to see the "red" jaws rotate out
            duration: 5,
            // delay: 1,
            ease: "power1.inOut"
        }, "<") // Start simultaneously with height expansion
        .to([jawLower], {
            rotation: 90, // Rotate down-left
            // autoAlpha: 0,
            duration: 5,
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
