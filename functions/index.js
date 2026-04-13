const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();

// Program price catalog — amounts in cents for Stripe
const PROGRAMS = {
  "reset-full":           { name: "The Confident Reset",                    amount: 9700,   mode: "payment" },
  "rebuild-full":         { name: "Rebuild: The Confidence Foundation",      amount: 39700,  mode: "payment" },
  "thrive-full":          { name: "Thrive: Advanced Confidence Mastery",     amount: 69700,  mode: "payment" },
  "vip-support":          { name: "Confidence Mastery + VIP Support",        amount: 99700,  mode: "payment" },
  "blueprint-early":      { name: "Empowered Identity Blueprint (Early PIF)",amount: 500000, mode: "payment" },
  "blueprint-full":       { name: "Empowered Identity Blueprint (PIF)",      amount: 550000, mode: "payment" },
  "blueprint-3":          { name: "Empowered Identity Blueprint (3 Payments)",amount: 189700,mode: "subscription", interval: "month", interval_count: 3 },
  "blueprint-4":          { name: "Empowered Identity Blueprint (4 Payments)",amount: 149600,mode: "subscription", interval: "month", interval_count: 4 },
  "blueprint-6":          { name: "Empowered Identity Blueprint (6 Payments)",amount: 99700, mode: "subscription", interval: "month", interval_count: 6 },
  "reinvention-early":    { name: "Complete Reinvention Intensive (Early PIF)", amount: 700000, mode: "payment" },
  "reinvention-full":     { name: "Complete Reinvention Intensive (PIF)",    amount: 750000, mode: "payment" },
  "reinvention-2":        { name: "Complete Reinvention Intensive (2 Payments)", amount: 389700, mode: "subscription", interval: "month", interval_count: 2 },
  "reinvention-4":        { name: "Complete Reinvention Intensive (4 Payments)", amount: 199700, mode: "subscription", interval: "month", interval_count: 4 },
  "pinnacle-early":       { name: "The Pinnacle: Complete Life Mastery (Early PIF)", amount: 1200000, mode: "payment" },
  "pinnacle-full":        { name: "The Pinnacle: Complete Life Mastery (PIF)", amount: 1400000, mode: "payment" },
  "pinnacle-2":           { name: "The Pinnacle: Complete Life Mastery (2 Payments)", amount: 768750, mode: "subscription", interval: "month", interval_count: 2 },
  "pinnacle-4":           { name: "The Pinnacle: Complete Life Mastery (4 Payments)", amount: 393750, mode: "subscription", interval: "month", interval_count: 4 },
  "pinnacle-12":          { name: "The Pinnacle: Complete Life Mastery (12 Payments)", amount: 143750, mode: "subscription", interval: "month", interval_count: 12 },
};

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { paymentId } = data;

  const program = PROGRAMS[paymentId];
  if (!program) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid program selected.");
  }

  // Get secret key from environment variable
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new functions.https.HttpsError("internal", "Stripe secret key not configured.");
  }

  const stripeClient = stripe(stripeSecretKey);
  const origin = data.origin || "https://coaching-with-michelle.web.app";
  const successUrl = data.successUrl || `${origin}/checkout.html?success=true`;
  const cancelUrl  = data.cancelUrl  || `${origin}/checkout.html?cancelled=true`;

  try {
    let sessionConfig = {
      success_url: successUrl,
      cancel_url:  cancelUrl,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: program.name },
            unit_amount: program.amount,
            ...(program.mode === "subscription" && {
              recurring: {
                interval: program.interval,
              }
            }),
          },
          quantity: 1,
        },
      ],
      mode: program.mode === "subscription" ? "subscription" : "payment",
    };

    const session = await stripeClient.checkout.sessions.create(sessionConfig);
    return { url: session.url };

  } catch (err) {
    console.error("Stripe error:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});
