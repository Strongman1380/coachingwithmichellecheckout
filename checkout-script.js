/**
 * ========================================
 * COACHING WITH MICHELLE - CHECKOUT PAGE
 * ========================================
 */

function initializeCheckoutButtons() {
    const checkoutButtons = document.querySelectorAll('.checkout-btn[data-program-id]');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const programCard = this.closest('.program-card');
            const selectedRadio = programCard ? programCard.querySelector('input[type="radio"]:checked') : null;

            if (!selectedRadio) {
                alert('Please select a payment option.');
                return;
            }

            const paymentId = selectedRadio.id;

            const originalText = this.innerHTML;
            this.innerHTML = '<span style="opacity:0.7">Loading Secure Checkout...</span>';
            this.disabled = true;

            // Call the Stripe Firebase Cloud Function
            const functionUrl = 'https://us-central1-coaching-with-michelle.cloudfunctions.net/createCheckoutSession';
            
            fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        paymentId: paymentId,
                        origin: window.location.origin
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                // Firebase onCall endpoints wrap response in `result`
                if (data.error) {
                    throw new Error(data.error.message || 'Unknown server error');
                }
                
                const url = data.result ? data.result.url : null;
                if (!url) {
                    throw new Error('No checkout URL was returned. Please try again later.');
                }
                
                window.location.href = url;
            })
            .catch(error => {
                console.error("Error creating checkout session:", error);
                alert("An error occurred while loading checkout: " + error.message);
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    });
}

function initializePaymentOptions() {
    const radioButtons = document.querySelectorAll('.payment-option input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
            this.closest('.payment-option').classList.add('active');
        });
    });
}

function initializeAccessGate() {
    const overlay = document.getElementById('checkout-gate');
    if (!overlay) return;

    // Show overlay if not already unlocked
    if (!window.cwmGate || !window.cwmGate.isUnlocked()) {
        overlay.classList.remove('hidden');
    }

    const input    = document.getElementById('gate-code-input');
    const submitBtn = document.getElementById('gate-submit-btn');
    const errorMsg = document.getElementById('gate-error');

    function attemptUnlock() {
        if (!window.cwmGate) return;
        if (window.cwmGate.tryUnlock(input.value)) {
            overlay.classList.add('hidden');
            errorMsg.style.display = 'none';
        } else {
            errorMsg.style.display = 'block';
            input.classList.add('gate-shake');
            setTimeout(() => input.classList.remove('gate-shake'), 400);
            input.value = '';
            input.focus();
        }
    }

    submitBtn.addEventListener('click', attemptUnlock);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') attemptUnlock();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initializePaymentOptions();
    initializeCheckoutButtons();
    initializeAccessGate();
});
