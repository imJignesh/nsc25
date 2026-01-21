gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ----------------------------
// GLOBAL UTILITIES & REFRESH
// ----------------------------
const refreshAll = () => {
    ScrollTrigger.refresh();
};

// Comprehensive initialization on load
window.addEventListener("load", () => {
    // Handle hash navigation
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            // Small delay to ensure DOM is settled
            setTimeout(() => {
                lenis.scrollTo(target, { immediate: true });
                // Force refresh after hash scroll
                setTimeout(refreshAll, 100);
            }, 50);
        }
    }

    // Initial refresh with delay to ensure all elements are measured
    setTimeout(refreshAll, 100);

    // Additional refresh to catch any late-loading content
    setTimeout(refreshAll, 500);
});

// Debounced resize handler for better performance
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        refreshAll();
    }, 150);
});

window.addEventListener("hashchange", () => {
    refreshAll();
    // Small delay for layout changes
    setTimeout(refreshAll, 100);
});

// Handle anchor links smoothly
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            lenis.scrollTo(target, {
                offset: 0,
                duration: 1.5,
                onComplete: () => {
                    refreshAll();
                }
            });
            history.pushState(null, null, targetId);
        }
    });
});

// ----------------------------
// HERO & FIXED ELEMENTS
// ----------------------------
const heroSection = document.querySelector("#hero");
const heroVideo = document.querySelector("#hero-video");
const heroRectEl = document.querySelector("#hero-rect");
const heroSequenceImg = document.querySelector("#hero-sequence-img");

// Preload sequence images
const imageCount = 4;
const images = [];
if (heroSequenceImg) {
    for (let i = 1; i <= imageCount; i++) {
        const img = new Image();
        img.src = `assets/hero/static/banner-2/${i}.jpg`;
        images.push(img);
    }
}

if (heroSection && heroVideo && heroRectEl) {
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
            borderRadius: "0px",
            ease: "none",
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "+=50%",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    if (heroSequenceImg) {
                        const frame = Math.max(0, Math.min(imageCount - 1, Math.floor(self.progress * imageCount)));
                        heroSequenceImg.src = images[frame].src;
                    }
                }
            },
        }
    );

    const fixedHeroBody = heroSection.querySelector('.container-fluid.position-fixed');
    if (fixedHeroBody) {
        ScrollTrigger.create({
            trigger: heroSection,
            start: "bottom top",
            end: "bottom top",
            invalidateOnRefresh: true,
            onEnter: () => gsap.set(fixedHeroBody, { visibility: "hidden" }),
            onLeaveBack: () => gsap.set(fixedHeroBody, { visibility: "visible" }),
            onRefresh: (self) => {
                // Check current position and set visibility accordingly
                const rect = heroSection.getBoundingClientRect();
                if (rect.bottom < 0) {
                    gsap.set(fixedHeroBody, { visibility: "hidden" });
                } else {
                    gsap.set(fixedHeroBody, { visibility: "visible" });
                }
            }
        });
    }
}

const highlightsSection = document.querySelector("#highlights");
const highlightsPin = document.querySelector("#highlights-pin");
if (highlightsSection && highlightsPin) {
    ScrollTrigger.create({
        trigger: highlightsSection,
        start: "bottom top",
        end: "bottom top",
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(highlightsPin, { visibility: "hidden" }),
        onLeaveBack: () => gsap.set(highlightsPin, { visibility: "visible" }),
        onRefresh: (self) => {
            const rect = highlightsSection.getBoundingClientRect();
            if (rect.bottom < 0) {
                gsap.set(highlightsPin, { visibility: "hidden" });
            } else {
                gsap.set(highlightsPin, { visibility: "visible" });
            }
        }
    });
}

// ----------------------------
// HERO 3D TILT EFFECT
// ----------------------------
const heroClipContainer = document.querySelector(".hero-clip-wrapper");
const tiltState = { intensity: 1 };

if (heroSection && heroVideo && heroClipContainer) {
    ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "+=50%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            tiltState.intensity = 1 - self.progress;
        },
        onRefresh: (self) => {
            // Set intensity based on current scroll position
            tiltState.intensity = 1 - self.progress;
        }
    });

    const clipRotTo = gsap.quickTo(heroClipContainer, "rotation", { duration: 0.5, ease: "power1.out" });
    const vidRotYTo = gsap.quickTo(heroVideo, "rotationY", { duration: 0.5, ease: "power1.out" });
    const vidRotXTo = gsap.quickTo(heroVideo, "rotationX", { duration: 0.5, ease: "power1.out" });

    gsap.set([heroClipContainer, heroVideo], { transformPerspective: 1000, transformOrigin: "center center", force3D: true });

    window.addEventListener("mousemove", (e) => {
        if (tiltState.intensity <= 0.01) return;

        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;
        const intensity = tiltState.intensity;

        clipRotTo(xPos * 10 * intensity);
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
            start: "bottom center",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
        }
    });
}

// ----------------------------
// BLUEPRINT SCROLL INTERACTION
// ----------------------------
const blueprintItems = document.querySelectorAll(".blueprint-item");
const blueprintIcons = document.querySelectorAll(".blueprint-icon");

if (blueprintItems.length > 0 && blueprintIcons.length > 0) {
    gsap.set(blueprintIcons, { autoAlpha: 0, scale: 0.8 });
    gsap.set(blueprintIcons[0], { autoAlpha: 1, scale: 1 });
    blueprintItems[0].classList.add('active');

    const blueprintSection = document.querySelector("#blueprint");
    const iconsHolder = document.querySelector(".icons-holder");
    if (blueprintSection && iconsHolder) {
        ScrollTrigger.create({
            trigger: blueprintSection,
            start: "bottom top",
            end: "bottom top",
            invalidateOnRefresh: true,
            onEnter: () => gsap.set(iconsHolder, { visibility: "hidden" }),
            onLeaveBack: () => gsap.set(iconsHolder, { visibility: "visible" }),
            onRefresh: (self) => {
                const rect = blueprintSection.getBoundingClientRect();
                if (rect.bottom < 0) {
                    gsap.set(iconsHolder, { visibility: "hidden" });
                } else {
                    gsap.set(iconsHolder, { visibility: "visible" });
                }
            }
        });
    }

    let currentActiveIndex = 0;
    const stickyPosition = window.innerHeight * 0.4;
    let ticking = false;

    const checkBlueprint = () => {
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

        if (closestIndex !== currentActiveIndex) {
            currentActiveIndex = closestIndex;
            updateBlueprintState(closestIndex);
        }
    };

    ScrollTrigger.create({
        trigger: ".blueprint-list",
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkBlueprint();
                    ticking = false;
                });
                ticking = true;
            }
        },
        onRefresh: () => {
            checkBlueprint();
        }
    });

    // Run on load
    checkBlueprint();

    function updateBlueprintState(activeIndex) {
        blueprintIcons.forEach((icon, i) => {
            if (i === activeIndex) {
                gsap.to(icon, { autoAlpha: 1, scale: 3, duration: 0.6, ease: "power2.out", overwrite: true });
            } else {
                gsap.to(icon, { autoAlpha: 0, scale: 0.8, duration: 0.4, ease: "power2.out", overwrite: true });
            }
        });

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
        const imgWrapper = card.querySelector(".ratio");
        const img = card.querySelector("img");

        if (imgWrapper && img) {
            gsap.set(imgWrapper, { clipPath: "inset(0 0 100% 0)" });
            gsap.set(img, { scale: 1.4 });

            gsap.to(imgWrapper, {
                clipPath: "inset(0 0 0% 0)",
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 60%",
                    end: "top 40%",
                    toggleActions: "play none none reverse",
                    invalidateOnRefresh: true
                }
            });

            gsap.to(img, {
                scale: 1,
                duration: 1.4,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                    invalidateOnRefresh: true
                }
            });
        }

        if (index < stackCards.length - 1) {
            const nextCard = stackCards[index + 1];
            const rotation = index % 2 === 0 ? -5 : 5;

            gsap.to(card, {
                scale: 0.9,
                opacity: 0,
                rotation: rotation,
                transformOrigin: "center top",
                ease: "none",
                scrollTrigger: {
                    trigger: nextCard,
                    start: "top top+=400px",
                    end: "top top-=100px",
                    scrub: true,
                    invalidateOnRefresh: true
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
            start: "center bottom",
            end: "center top-=200",
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    tl.to(awardsSection, {
        maxHeight: "150vh",
        minHeight: "100vh",
        duration: 5,
        ease: "power1.inOut",
        onUpdate: () => ScrollTrigger.refresh()
    })
        .to([jawUpper], {
            rotation: -90,
            duration: 10,
            ease: "power1.inOut"
        }, "<")
        .to([jawLower], {
            rotation: 90,
            duration: 10,
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

        const dataSource = item.querySelector(".impact-data-source");
        const titleData = dataSource ? dataSource.querySelector(".data-title").innerText : "";
        const textData = dataSource ? dataSource.querySelector(".data-text").innerText : "";

        ScrollTrigger.create({
            trigger: item,
            start: "top center+=100",
            end: "bottom center+=100",
            invalidateOnRefresh: true,
            onEnter: () => updateImpactState(item, titleData, textData),
            onEnterBack: () => updateImpactState(item, titleData, textData),
            onLeave: () => hideOverlay(item),
            onLeaveBack: () => hideOverlay(item),
            onRefresh: (self) => {
                // Check if we're currently in the trigger zone
                const rect = item.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const isInZone = rect.top < viewportCenter + 100 && rect.bottom > viewportCenter + 100;

                if (isInZone) {
                    updateImpactState(item, titleData, textData);
                } else {
                    hideOverlay(item);
                }
            }
        });
    });

    function updateImpactState(activeItem, title, text) {
        gsap.to([impactTitle, impactText], {
            opacity: 0,
            duration: 0.15,
            onComplete: () => {
                impactTitle.innerText = title;
                impactText.innerText = text;
                gsap.to([impactTitle, impactText], { opacity: 1, duration: 0.15 });
            }
        });

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
            const updateDotPosition = () => {
                const hRect = heading.getBoundingClientRect();
                const cRect = card.getBoundingClientRect();
                return {
                    x: (hRect.left - cRect.left) - 25,
                    y: (hRect.top - cRect.top) + (hRect.height / 2)
                };
            };

            let dotPos = updateDotPosition();
            gsap.set(gooeyBg, {
                left: dotPos.x,
                top: dotPos.y,
                scale: 0.04,
                height: 500,
                width: 500,
                xPercent: -50,
                yPercent: -50,
                opacity: 1
            });

            card.addEventListener("mouseenter", () => {
                const rect = card.getBoundingClientRect();
                gsap.to(gooeyBg, {
                    scale: 1,
                    left: rect.width / 2,
                    top: rect.height / 2,
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: true
                });
            });

            card.addEventListener("mouseleave", () => {
                dotPos = updateDotPosition();
                gsap.to(gooeyBg, {
                    scale: 0.04,
                    left: dotPos.x,
                    top: dotPos.y,
                    duration: 0.5,
                    ease: "power3.inOut",
                    overwrite: true
                });
            });

            const xTo = gsap.quickTo ? gsap.quickTo(gooeyBg, "left", { duration: 0.8, ease: "power3" }) : null;
            const yTo = gsap.quickTo ? gsap.quickTo(gooeyBg, "top", { duration: 0.8, ease: "power3" }) : null;

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

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

            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    dotPos = updateDotPosition();
                    if (!card.matches(':hover')) {
                        gsap.set(gooeyBg, { left: dotPos.x, top: dotPos.y });
                    }
                }, 150);
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
    gsap.set(roadshowImages, { opacity: 0, scale: 1.1 });

    const roadshowSection = document.querySelector("#roadshows");
    const roadshowImgContainer = document.querySelector("#roadshow-image-container");
    if (roadshowSection && roadshowImgContainer) {
        ScrollTrigger.create({
            trigger: roadshowSection,
            start: "bottom top",
            end: "bottom top",
            invalidateOnRefresh: true,
            onEnter: () => gsap.set(roadshowImgContainer, { visibility: "hidden" }),
            onLeaveBack: () => gsap.set(roadshowImgContainer, { visibility: "visible" }),
            onRefresh: (self) => {
                const rect = roadshowSection.getBoundingClientRect();
                if (rect.bottom < 0) {
                    gsap.set(roadshowImgContainer, { visibility: "hidden" });
                } else {
                    gsap.set(roadshowImgContainer, { visibility: "visible" });
                }
            }
        });
    }

    let currentActiveRoadshow = null;
    let ticking = false;

    const checkRoadshow = () => {
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

        if (closestTarget && closestTarget !== currentActiveRoadshow) {
            currentActiveRoadshow = closestTarget;
            updateRoadshowState(closestTarget);
        }
    };

    ScrollTrigger.create({
        trigger: ".roadshow-list",
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkRoadshow();
                    ticking = false;
                });
                ticking = true;
            }
        },
        onRefresh: () => {
            checkRoadshow();
        }
    });

    checkRoadshow();

    function updateRoadshowState(targetId) {
        roadshowItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const activeImg = document.querySelector(`.roadshow-img[data-city="${targetId}"]`);

        if (activeImg) {
            roadshowImages.forEach(img => {
                if (img !== activeImg) {
                    gsap.to(img, { opacity: 0, scale: 1.1, duration: 0.4, ease: "power2.out", overwrite: true });
                }
            });

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
// GENERIC 3D TILT INTERACTION
// ----------------------------
function addSectionTiltEffect(sectionSelector, targetSelector, intensity = 20) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const targets = section.querySelectorAll(targetSelector);
    if (targets.length === 0) return;

    targets.forEach(el => {
        gsap.set(el, { transformPerspective: 1000, transformStyle: "preserve-3d" });
    });

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
            const width = rect.width;
            const height = rect.height;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const xPct = (mouseX / width - 0.5) * 2;
            const yPct = (mouseY / height - 0.5) * 2;

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

addSectionTiltEffect("#roadshows", "#roadshow-image-container", 5);
addSectionTiltEffect("#impact", ".impact-img-wrapper", 5);

// ----------------------------
// UNIVERSAL TEXT REVEAL ANIMATION
// ----------------------------
window.addEventListener("load", () => {
    const revealElements = document.querySelectorAll("section h1, section h2, section h3, section h4, section h5, section h6, section p.lead");
    const itemsToAnimate = [];

    revealElements.forEach(el => {
        if (el.closest('#hero') || el.closest('.carousel-caption') || el.closest('.stack-card') ||
            el.closest('.nav') || el.classList.contains('no-reveal') || el.classList.contains('impact-number')) return;

        const originalText = el.innerText;
        if (!originalText.trim()) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-wrapper';
        Object.assign(wrapper.style, {
            overflow: 'hidden',
            display: 'block',
            margin: '0',
            padding: '0'
        });

        const inner = document.createElement('div');
        inner.className = 'text-reveal-inner';
        inner.style.display = 'block';
        inner.style.willChange = 'transform, opacity';

        while (el.firstChild) {
            inner.appendChild(el.firstChild);
        }

        wrapper.appendChild(inner);
        el.appendChild(wrapper);

        gsap.set(inner, { y: "100%", opacity: 0 });
        itemsToAnimate.push(inner);
    });

    ScrollTrigger.batch(itemsToAnimate, {
        start: "top 85%",
        once: true,
        invalidateOnRefresh: true,
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
        end: 99999,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            if (self.scroll() > window.innerHeight / 2) {
                if (!navbar.classList.contains("glass")) {
                    navbar.classList.add("glass");
                }
            } else {
                if (navbar.classList.contains("glass")) {
                    navbar.classList.remove("glass");
                }
            }
        },
        onRefresh: (self) => {
            // Set navbar state based on current scroll position
            if (self.scroll() > window.innerHeight / 2) {
                navbar.classList.add("glass");
            } else {
                navbar.classList.remove("glass");
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