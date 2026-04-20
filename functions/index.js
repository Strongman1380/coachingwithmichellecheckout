const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();

// Program price catalog — amounts in cents for Stripe
const PROGRAMS = {
  "confidence-reset-solo":    { name: "Confidence Reset (Self-Paced)", amount: 29700, mode: "payment" },
  "confidence-reset-support": { name: "Confidence Reset (With 1 Support Call)", amount: 59700, mode: "payment" },
  "divorce-reset-solo":       { name: "Post-Divorce Reset (Self-Paced)", amount: 49700, mode: "payment" },
  "divorce-reset-support":    { name: "Post-Divorce Reset (With 2 Support Calls)", amount: 79700, mode: "payment" },
  "intensive-full":           { name: "Implementation Intensive (Pay In Full)", amount: 129700, mode: "payment" },
  "intensive-2":              { name: "Implementation Intensive (Payment 1 of 2)", amount: 64850, mode: "payment" },
  "program-pif":              { name: "The Program (Pay In Full)", amount: 350000, mode: "payment" },
  "program-plan":             { name: "The Program (Initial Deposit)", amount: 200000, mode: "payment" },
  "vip-full":                 { name: "Sovereign VIP (Pay In Full)", amount: 700000, mode: "payment" },
  "masterclass-vip":          { name: "Masterclass VIP Ticket", amount: 9700, mode: "payment" }
};

// ── AI Chat ────────────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are Michelle's friendly AI assistant on her coaching website. You help women who feel stuck in "survival mode" understand how her programs can support their transformation.

About Michelle:
Michelle is a life and identity coach who helps women move from survival mode into sovereign, purposeful living. Her work is built on the Ascension Framework — a four-pillar methodology that guides women from awareness to full identity transformation.

The Ascension Framework (4 pillars):
1. Awareness — Understanding the internal patterns keeping you stuck
2. Activation — Activating an identity shift and regulating your nervous system
3. Application — Applying the work through structured programs that produce real results
4. Ascension — Expanding into sovereign leadership and a fully expressed life

Programs offered:
- The Masterclass (FREE live training) — An introduction to the Ascension Framework. Great starting point. Visitors can check upcoming dates on the Event Board at event.html.
- From Survival to Sovereignty (6-Week Intensive Manifestation Training) — The flagship program. Six weeks of structured identity rewiring, nervous system work, weekly group coaching, and accountability. For women ready for deep, structural transformation. (program.html)
- Sovereign VIP — Private, invitation-only mentorship for women ready for elite-level identity work. (vip.html)
- Accelerator: Private Intensive — A focused private intensive session. (intensive.html)
- Workshop: Post-Divorce Reset — Identity inventory, pattern release, nervous system reset, and forward architecture. (post-divorce-reset.html)
- Workshop: Confidence Reset — Root audit, identity rewiring, nervous system regulation, and sovereign anchoring. (confidence-reset.html)

How to help visitors:
- If they're new or unsure where to start → suggest The Masterclass and the Event Board (event.html)
- If they're ready for a full transformation program → point to From Survival to Sovereignty (program.html)
- If they want to talk to Michelle directly → encourage them to book a free discovery call (book.html)
- If they have questions about a specific program → describe it warmly and suggest booking a call to discuss fit

Tone: warm, encouraging, direct. You're not a salesperson — you're a guide helping them find the right next step. Keep responses concise (2–4 sentences max unless they ask for more detail). Never make up prices or details not listed above. If unsure, invite them to book a discovery call.`;

exports.chat = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith("PASTE_")) {
    res.status(500).json({ error: "AI not configured yet. Please check back soon!" });
    return;
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  try {
    const client = new Anthropic.Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: CHAT_SYSTEM_PROMPT,
      messages: messages.slice(-10), // keep last 10 turns to control cost
    });

    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error("Anthropic error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Stripe Checkout ─────────────────────────────────────────────────────────

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const payload = data && typeof data === "object" && data.data &&
    typeof data.data === "object" ? data.data : data;
  const paymentId = payload && typeof payload === "object" ? payload.paymentId : null;

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
  const origin = payload.origin || "https://coaching-with-michelle.web.app";
  const successUrl = payload.successUrl || `${origin}/checkout.html?success=true`;
  const cancelUrl  = payload.cancelUrl  || `${origin}/checkout.html?cancelled=true`;

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
