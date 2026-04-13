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
// ========================================
// STRIPE PAYMENT LINKS CONFIGURATION
// ========================================
const stripeLinks = {
    // LEVEL 1: Masterclass
    'masterclass-beta': 'https://buy.stripe.com/test_dRm00l4xCc1NdRs3TU3oA0f', // Placeholder for Beta
    'masterclass-full': 'https://buy.stripe.com/test_28E7sN0hme9V9Bc6223oA03',

    // LEVEL 2: The Program
    'program-self': 'https://book.stripe.com/test_dRmcN7e8cfdZdRsbmm3oA04',
    'program-supported': 'https://book.stripe.com/test_bJe7sN2puc1N7t4aii3oA02',
    'program-plan': 'https://buy.stripe.com/test_fZu6oJc048PB28K4XY3oA08',

    // LEVEL 3: Sovereign VIP
    'vip-mid': 'https://book.stripe.com/test_dRmeVf5BG8PB3cO0HI3oA01',
    'vip-high': 'https://buy.stripe.com/test_3cIeVf6FK5DpaFg4XY3oA0a',

    // Add-ons & Intensive
    'intensive': 'https://buy.stripe.com/test_00wbJ3e8cd5RbJkcqq3oA0e'
};

// ========================================
// PROGRAM DATA CONFIGURATION
// ========================================
const programData = {
    'masterclass': {
        title: 'From Fine to Done: The Masterclass',
        subtitle: 'The Awareness Foundation (Entry Class)',
        price: '$247 — $497',
        badge: 'New Launch',
        description: 'A foundational 4–6 week digital class teaching the core framework behind identity patterns, nervous system activation, and why \'fine\' feels like survival. Perfect for women ready to understand what\'s been holding them back.',
        buttonText: 'Enroll in Masterclass',
        paymentOptions: [
            { id: 'masterclass-beta', name: 'master-payment', label: 'Beta Launch (10 Spots Only)', price: '$247', value: '247', checked: true, savings: '50% Off' },
            { id: 'masterclass-full', name: 'master-payment', label: 'Standard Price', price: '$497', value: '497' }
        ]
    },
    'core-program': {
        title: 'From Fine to Done: The Program',
        subtitle: '12 Weeks of Identity & Pattern Rewiring',
        price: '$997 — $2,000',
        badge: 'Recommended',
        description: 'Our flagship 12-week intensive designed for women ready to genuinely shift how they operate. Structured curriculum, accountability, and the actual rewiring of your operant patterns.',
        buttonText: 'Join the Program',
        paymentOptions: [
            { id: 'program-supported', name: 'program-payment', label: 'Supported Tier (Group Coaching)', price: '$2,000', value: '2000', checked: true },
            { id: 'program-self', name: 'program-payment', label: 'Self-Paced Tier', price: '$997', value: '997' },
            { id: 'program-plan', name: 'program-payment', label: 'Supported Payment Plan', price: '$697/mo (3)', value: '697' }
        ]
    },
    'sovereign-vip': {
        title: 'Sovereign VIP Experience',
        subtitle: 'Elite Private Identity Mentorship',
        price: '$3,000 — $10,000',
        badge: 'Exclusive',
        badgeClass: 'gold',
        description: 'Private, invitation-only access for identity expansion, high-level decision coaching, and visibility building. Direct proximity and real-time support from Jocelyn.',
        buttonText: 'Apply for VIP Access',
        paymentOptions: [
            { id: 'vip-mid', name: 'vip-payment', label: 'Mid-Tier VIP (3 Months)', price: '$5,000', value: '5000', checked: true },
            { id: 'vip-high', name: 'vip-payment', label: 'High-Tier VIP (6 Months)', price: '$10,000', value: '10000' }
        ]
    },
    'intensive': {
        title: 'Private Implementation Intensive',
        subtitle: 'Your 90-Minute Identity Blueprint',
        price: '$497',
        badge: 'Upsell',
        description: 'A deep-dive session to take what you\'ve learned and turn it into your exact blueprint. 1:1 strategy, pattern mapping, and customized action plan.',
        buttonText: 'Book Intensive',
        paymentOptions: [
            { id: 'intensive', name: 'intensive-payment', label: 'One Payment', price: '$497', value: '497', checked: true }
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