/**
 * Access Gate — Coaching with Michelle
 *
 * Controls who can see the checkout page and checkout buttons.
 * Valid code is stored in localStorage so the user only needs
 * to enter it once per browser.
 *
 * =============================================
 * TO CHANGE THE ACCESS CODE: update ACCESS_CODE
 * TO RESET A USER'S ACCESS: have them clear
 *   localStorage in DevTools, or call cwmGate.lock()
 * =============================================
 */

(function () {
    const ACCESS_CODE = 'MICHELLE2024'; // <-- change this code here
    const STORAGE_KEY = 'cwm_access';

    function isUnlocked() {
        return localStorage.getItem(STORAGE_KEY) === ACCESS_CODE;
    }

    function tryUnlock(inputCode) {
        if (!inputCode) return false;
        const normalized = inputCode.trim().toUpperCase();
        if (normalized === ACCESS_CODE.toUpperCase()) {
            localStorage.setItem(STORAGE_KEY, ACCESS_CODE);
            return true;
        }
        return false;
    }

    function lock() {
        localStorage.removeItem(STORAGE_KEY);
    }

    window.cwmGate = { isUnlocked, tryUnlock, lock };
})();
