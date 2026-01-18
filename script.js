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

if (heroSection && heroVideo && heroClipContainer) {
    window.addEventListener("mousemove", (e) => {
        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;

        // Animate Clip Container (Tilt A)
        gsap.to(heroClipContainer, {
            rotation: xPos * 10,  // Max 5 degrees tilt
            scale: 1.03, // Inverted Y axis for natural feel
            transformPerspective: 1000,
            transformOrigin: "center center",
            ease: "power1.out",
            duration: 0.5
        });

        // Animate Video Element (Tilt B - Opposite Direction)
        gsap.to(heroVideo, {
            rotationY: -xPos * 10,
            rotationX: yPos * 10,
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
