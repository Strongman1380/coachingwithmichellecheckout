/**
 * ========================================
 * COACHING WITH MICHELLE - CHECKOUT PAGE
 * ========================================
 *
 * This script handles:
 * - Program dropdown selection
 * - Dynamic program card rendering
 * - Payment option selection highlighting
 * - Dynamic Stripe link assignment based on selected payment plan
 * - Checkout button click handling
 */

// ========================================
// STRIPE PAYMENT LINKS CONFIGURATION
// ========================================
const stripeLinks = {
    // Program 1: The Confident Reset
    'reset-full': 'https://book.stripe.com/test_bJecN72pu7LxaFgbmm3oA00',
    'reset-premium': 'https://book.stripe.com/28E5kC9fA99V3cW9QF6AM0h',

    // Program 2: Rebuild: The Confidence Foundation
    'rebuild-full': 'https://book.stripe.com/test_4gMcN74xC1n900C8aa3oA06',

    // Program 3: Thrive: Advanced Confidence Mastery
    'thrive-full': 'https://book.stripe.com/test_00w00ld48c1NeVwcqq3oA05',

    // Program 4: Confidence Mastery + VIP Support
    'vip-full': 'https://book.stripe.com/test_dRmcN7e8cfdZdRsbmm3oA04',

    // Program 5: The Empowered Identity Blueprint
    'blueprint-early': 'https://buy.stripe.com/test_dRm00l4xCc1NdRs3TU3oA0f',
    'blueprint-full': 'https://buy.stripe.com/test_28E7sN0hme9V9Bc6223oA03',
    'blueprint-3': 'https://buy.stripe.com/test_fZu6oJc048PB28K4XY3oA08',
    'blueprint-4': 'https://buy.stripe.com/test_bJe28te8ce9V3cO1LM3oA0j',
    'blueprint-6': 'https://buy.stripe.com/test_fZu4gBfcg1n9aFg2PQ3oA0i',

    // Program 6: The Complete Reinvention Intensive
    'reinvention-early': 'https://book.stripe.com/test_bJe7sN2puc1N7t4aii3oA02',
    'reinvention-full': 'https://buy.stripe.com/test_00wbJ3e8cd5RbJkcqq3oA0e',
    'reinvention-2': 'https://buy.stripe.com/test_7sYeVf7JO4zl5kW8aa3oA0g',
    'reinvention-4': 'https://buy.stripe.com/test_8x2cN70hm6HteVw0HI3oA0h',

    // Program 7: The Pinnacle: Complete Life Mastery
    'pinnacle-early': 'https://buy.stripe.com/test_eVq8wR6FK7Lx4gSduu3oA0d',
    'pinnacle-full': 'https://book.stripe.com/test_dRmeVf5BG8PB3cO0HI3oA01',
    'pinnacle-2': 'https://buy.stripe.com/test_eVq9AVaW0aXJfZAbmm3oA0c',
    'pinnacle-4': 'https://buy.stripe.com/test_9B614pd488PBaFg4XY3oA0b',
    'pinnacle-12': 'https://buy.stripe.com/test_3cIeVf6FK5DpaFg4XY3oA0a'
};

// ========================================
// PROGRAM DATA CONFIGURATION
// ========================================
const programData = {
    'confident-reset': {
        title: 'The Confident Reset',
        subtitle: 'A 7-Day Reconnection Experience',
        price: '$97 or $499',
        badge: null,
        description: 'A focused reset designed for women ready to break free from emotional exhaustion and rediscover their inner confidence. Learn how to silence self-doubt, rebuild daily motivation, and reconnect with your true sense of power. A perfect quick-start for your confidence journey. Add the $499 option to include the program, materials, and two 60-minute coaching sessions.',
        buttonText: 'Begin Your Reset',
        paymentOptions: [
            { id: 'reset-full', name: 'reset-payment', label: 'Pay in Full', price: '$97', value: '97', checked: true },
            { id: 'reset-premium', name: 'reset-payment', label: 'Pay in Full + Coaching Sessions', price: '$499', value: '499' }
        ]
    },
    'rebuild': {
        title: 'Rebuild: The Confidence Foundation',
        subtitle: '30-Day Confidence Transformation',
        price: '$397',
        badge: null,
        description: 'A comprehensive 30-day program designed to rebuild your confidence from the ground up. You\'ll uncover limiting beliefs, develop new empowering habits, and create a solid foundation for lasting self-assurance.',
        buttonText: 'Start Rebuilding',
        paymentOptions: [
            { id: 'rebuild-full', name: 'rebuild-payment', label: 'Pay in Full', price: '$397', value: '397', checked: true }
        ]
    },
    'thrive': {
        title: 'Thrive: Advanced Confidence Mastery',
        subtitle: '90-Day Deep Transformation',
        price: '$697',
        badge: null,
        description: 'Take your confidence to the next level with this advanced 90-day program. Master emotional resilience, develop unshakeable self-belief, and learn advanced techniques for thriving in all areas of life.',
        buttonText: 'Start Thriving',
        paymentOptions: [
            { id: 'thrive-full', name: 'thrive-payment', label: 'Pay in Full', price: '$697', value: '697', checked: true }
        ]
    },
    'vip': {
        title: 'Confidence Mastery + VIP Support',
        subtitle: 'Premium 1-on-1 Coaching Experience',
        price: '$997',
        badge: 'VIP',
        description: 'Experience personalized transformation with dedicated VIP support. This premium program includes everything in Thrive plus exclusive 1-on-1 coaching sessions, priority access, and personalized guidance tailored to your unique journey.',
        buttonText: 'Claim VIP Access',
        paymentOptions: [
            { id: 'vip-full', name: 'vip-payment', label: 'Pay in Full', price: '$997', value: '997', checked: true }
        ]
    },
    'blueprint': {
        title: 'The Empowered Identity Blueprint',
        subtitle: 'Redesign Your Life from the Inside Out',
        price: '$5,000 — $5,500',
        badge: 'Premium',
        description: 'A full-spectrum transformation experience that helps you embody your most authentic, confident, and purpose-driven self. Through guided coaching and proven identity-building frameworks, you\'ll create alignment in your goals, emotions, and daily systems.',
        buttonText: 'Claim Your Blueprint',
        paymentOptions: [
            { id: 'blueprint-early', name: 'blueprint-payment', label: 'Early Pay in Full', price: '$5,000', value: '5000', checked: true, savings: 'Save $500' },
            { id: 'blueprint-full', name: 'blueprint-payment', label: 'Pay in Full', price: '$5,500', value: '5500' },
            { id: 'blueprint-3', name: 'blueprint-payment', label: '3 Monthly Payments', price: '$1,897/mo', value: '1897' },
            { id: 'blueprint-4', name: 'blueprint-payment', label: '4 Monthly Payments', price: '$1,496/mo', value: '1496' },
            { id: 'blueprint-6', name: 'blueprint-payment', label: '6 Monthly Payments', price: '$997/mo', value: '997' }
        ]
    },
    'reinvention': {
        title: 'The Complete Reinvention Intensive',
        subtitle: 'Rebuild Your Confidence, Leadership, and Life Systems',
        price: '$7,000 — $7,500',
        badge: 'Elite',
        description: 'This high-level coaching experience blends emotional strategy with structural life redesign. You\'ll develop the systems, habits, and inner frameworks to sustain balance, confidence, and fulfillment long-term. Perfect for women stepping into leadership in life and career.',
        buttonText: 'Begin Your Reinvention',
        paymentOptions: [
            { id: 'reinvention-early', name: 'reinvention-payment', label: 'Early Pay in Full', price: '$7,000', value: '7000', checked: true, savings: 'Save $500' },
            { id: 'reinvention-full', name: 'reinvention-payment', label: 'Pay in Full', price: '$7,500', value: '7500' },
            { id: 'reinvention-2', name: 'reinvention-payment', label: '2 Monthly Payments', price: '$3,897/mo', value: '3897' },
            { id: 'reinvention-4', name: 'reinvention-payment', label: '4 Monthly Payments', price: '$1,997/mo', value: '1997' }
        ]
    },
    'pinnacle': {
        title: 'The Pinnacle: Complete Life Mastery',
        subtitle: 'The Ultimate Transformation Experience',
        price: '$14,000 — $15,000',
        badge: 'Signature',
        badgeClass: 'gold',
        description: 'The ultimate transformation experience for women ready to completely reinvent every aspect of their lives. This comprehensive program combines all elements of our coaching methodology with exclusive VIP access, personalized strategy sessions, and ongoing support for lasting transformation.',
        buttonText: 'Reach Your Pinnacle',
        paymentOptions: [
            { id: 'pinnacle-early', name: 'pinnacle-payment', label: 'Early Pay in Full', price: '$14,000', value: '14000', checked: true, savings: 'Save $1,000' },
            { id: 'pinnacle-full', name: 'pinnacle-payment', label: 'Pay in Full', price: '$15,000', value: '15000' },
            { id: 'pinnacle-2', name: 'pinnacle-payment', label: '2 Monthly Payments', price: '$7,750/mo', value: '7750' },
            { id: 'pinnacle-4', name: 'pinnacle-payment', label: '4 Monthly Payments', price: '$3,997/mo', value: '3997' },
            { id: 'pinnacle-12', name: 'pinnacle-payment', label: '12 Monthly Payments', price: '$1,397/mo', value: '1397' }
        ]
    }
};

// ========================================
// PROGRAM DROPDOWN HANDLER
// ========================================
function initializeProgramDropdown() {
    const dropdown = document.getElementById('program-select');
    const displayArea = document.getElementById('program-display');

    if (!dropdown || !displayArea) return;

    dropdown.addEventListener('change', function() {
        const selectedProgram = this.value;

        if (!selectedProgram) {
            // Show placeholder when no program selected
            displayArea.innerHTML = `
                <div class="placeholder-message">
                    <p>Select a program above to view details and checkout options</p>
                </div>
            `;
            return;
        }

        const program = programData[selectedProgram];
        if (!program) return;

        // Render the program card
        renderProgramCard(displayArea, program, selectedProgram);

        // Initialize payment options and checkout buttons for the new card
        initializePaymentOptions();
        initializeCheckoutButtons();

        // Scroll the card into view smoothly
        displayArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// ========================================
// RENDER PROGRAM CARD
// ========================================
function renderProgramCard(container, program, programKey) {
    const isFeatured = program.badge !== null;
    const badgeClass = program.badgeClass || '';

    let badgeHTML = '';
    if (program.badge) {
        badgeHTML = `<div class="featured-badge ${badgeClass}">${program.badge}</div>`;
    }

    let paymentOptionsHTML = '';
    program.paymentOptions.forEach(option => {
        const savingsBadge = option.savings ? `<span class="savings-badge">${option.savings}</span>` : '';
        const checkedAttr = option.checked ? 'checked' : '';

        paymentOptionsHTML += `
            <div class="payment-option" data-payment-id="${option.id}">
                <input type="radio" id="${option.id}" name="${option.name}" value="${option.value}" ${checkedAttr}>
                <label for="${option.id}">
                    <span class="option-label">${option.label}</span>
                    <span class="option-price">${option.price}</span>
                    ${savingsBadge}
                </label>
            </div>
        `;
    });

    // Get the initial stripe link (first checked option or first option)
    const defaultOption = program.paymentOptions.find(opt => opt.checked) || program.paymentOptions[0];
    const defaultStripeLink = stripeLinks[defaultOption.id] || '#';

    container.innerHTML = `
        <div class="program-card ${isFeatured ? 'featured' : ''} ${programKey === 'pinnacle' ? 'pinnacle' : ''}" data-program="${programKey}">
            ${badgeHTML}
            <div class="card-header">
                <h3 class="program-title">${program.title}</h3>
                <p class="program-subtitle">${program.subtitle}</p>
                <p class="program-price">${program.price}</p>
            </div>
            <p class="program-description">${program.description}</p>

            <div class="payment-options">
                ${paymentOptionsHTML}
            </div>

            <button class="checkout-btn" data-stripe-link="${defaultStripeLink}">
                ${program.buttonText}
            </button>
        </div>
    `;

    // Add animation class
    const card = container.querySelector('.program-card');
    card.style.animation = 'fadeIn 0.5s ease-out';
}

// ========================================
// PAYMENT OPTION SELECTION HANDLER
// ========================================
function initializePaymentOptions() {
    const radioButtons = document.querySelectorAll('.payment-option input[type="radio"]');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            const programCard = this.closest('.program-card');
            const checkoutButton = programCard.querySelector('.checkout-btn');
            const paymentId = this.id;

            // Update the checkout button's Stripe link
            if (stripeLinks[paymentId]) {
                checkoutButton.setAttribute('data-stripe-link', stripeLinks[paymentId]);
            }
        });
    });
}

// ========================================
// CHECKOUT BUTTON HANDLER
// ========================================
function initializeCheckoutButtons() {
    const checkoutButtons = document.querySelectorAll('.checkout-btn');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const stripeLink = this.getAttribute('data-stripe-link');

            // Check if Stripe link is configured
            if (!stripeLink || stripeLink === '#' || stripeLink.includes('[INSERT STRIPE LINK')) {
                alert('⚠️ Stripe payment link not yet configured.\n\nPlease update the stripeLinks object in script.js with your Stripe payment link for this option.');
                console.error('Stripe link not configured:', stripeLink);
                return;
            }

            // Redirect to Stripe checkout
            window.location.href = stripeLink;

            // Optional: Track analytics
            trackCheckout(this);
        });
    });
}

// ========================================
// ANALYTICS TRACKING (OPTIONAL)
// ========================================
function trackCheckout(button) {
    const programCard = button.closest('.program-card');
    const programName = programCard.querySelector('.program-title').textContent;
    const selectedRadio = programCard.querySelector('input[type="radio"]:checked');
    const selectedOption = selectedRadio ? selectedRadio.nextElementSibling.querySelector('.option-label').textContent : 'Unknown';

    console.log('Checkout initiated:', {
        program: programName,
        paymentOption: selectedOption,
        timestamp: new Date().toISOString()
    });
}

// ========================================
// INITIALIZE ON DOM LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Checkout page initialized');
    initializeProgramDropdown();
    initializePaymentOptions();
    initializeCheckoutButtons();
    console.log('✅ All systems ready');
});