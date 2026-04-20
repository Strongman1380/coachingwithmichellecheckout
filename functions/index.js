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
  "program-pif":              { name: "From Survival to Sovereignty (Pay in Full)", amount: 350000, mode: "payment" },
  "program-3pay":             { name: "From Survival to Sovereignty – Payment 1 of 3", amount: 116667, mode: "payment" },
  "vip-full":                 { name: "Sovereign VIP (Pay in Full)", amount: 700000, mode: "payment" },
  "vip-2pay":                 { name: "Sovereign VIP – Payment 1 of 2", amount: 350000, mode: "payment" },
  "vip-3pay":                 { name: "Sovereign VIP – Payment 1 of 3", amount: 233334, mode: "payment" },
  "vip-4pay":                 { name: "Sovereign VIP – Payment 1 of 4", amount: 175000, mode: "payment" },
  "masterclass-vip":          { name: "Masterclass VIP Ticket", amount: 9700, mode: "payment" }
};

// ── Go High Level ───────────────────────────────────────────────────────────

exports.ghlContact = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed." }); return; }

  const ghlKey = process.env.GHL_API_KEY;
  if (!ghlKey) { res.status(500).json({ error: "GHL not configured." }); return; }

  const { firstName, email, source, tags } = req.body;
  if (!email) { res.status(400).json({ error: "Email is required." }); return; }

  try {
    const response = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ghlKey}`,
        "Version": "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName || "",
        email,
        source: source || "Website",
        tags: tags || ["website-lead"],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("GHL error:", data);
      res.status(500).json({ error: "GHL error", detail: data });
      return;
    }
    res.json({ success: true, contactId: data.contact?.id });
  } catch (err) {
    console.error("GHL fetch error:", err);
    res.status(500).json({ error: "Failed to create GHL contact." });
  }
});

// ── AI Chat ────────────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are Michelle's warm, knowledgeable AI assistant on the Coaching with Michelle website. Your job is to guide women toward the right next step — whether that's registering for the free Masterclass, booking a discovery call, or learning more about a program. You have complete knowledge of every program, page, and process on this site.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT MICHELLE (JOCELYN LEMKE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Michelle's full name is Jocelyn Lemke. She is a Women's Success Coach specializing in post-divorce identity recovery, emotional clarity, and confidence. She helps women move from "survival mode" into sovereign, purposeful living.

Her background: She knows firsthand what it means to lose yourself — and what it takes to come back stronger, clearer, and more aligned. Her clients describe her as warm, deeply intuitive, and refreshingly direct. She doesn't do empty reassurance — she does transformational truth-telling wrapped in radical compassion.

Her framework: The 'From Fine to Done' Ecosystem, built on the Ascension Framework.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ASCENSION FRAMEWORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━
A four-pillar methodology that guides women from stuck to sovereign:

1. **Awareness** — Seeing the exact identity loops and internal patterns keeping you stuck in "fine." Named, mapped, understood.
2. **Activation** — Activating an identity shift. Regulating your nervous system. Breaking the survival-mode cycle at its root.
3. **Application** — Doing the actual work through Michelle's structured programs. Real results, not theory.
4. **Ascension** — Expanding into sovereign leadership. A fully expressed life. The woman you were always meant to become.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALL PROGRAMS — FULL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1. THE MASTERCLASS — "From Fine to Done" (FREE)**
Page: [The Masterclass](/masterclass.html)
Events & Registration: [View Upcoming Dates & Register](/event.html)
- Free live training where Michelle walks through the Ascension Framework and shows women exactly where they are in the model and what it takes to move forward.
- NOT a pitch — a real training that gives genuine clarity.
- At the end, Michelle invites attendees to book a discovery call.
- Spots are limited. Registration is via the Event Board.
- VIP Add-On ($97): An extra hour of live Q&A directly with Michelle after the Masterclass ends. [Get VIP Ticket](/masterclass-vip.html)
- Best first step for any woman who is new or unsure where to start.

**2. FROM SURVIVAL TO SOVEREIGNTY — 6-Week Intensive Manifestation Training (FLAGSHIP)**
Page: [From Survival to Sovereignty](/program.html)
- The flagship program. Six weeks of structured identity rewiring, nervous system work, weekly group coaching, and accountability.
- This is where the actual identity rewiring happens — deep, structural transformation, not surface-level mindset tips.
- Includes: weekly group coaching calls with Michelle, identity rewiring curriculum, nervous system regulation tools, accountability structure, and a community of women doing the same work.
- Ideal for women who are done "managing" their life and ready to change how they operate at the root.
- Payment plans available. Investment discussed on the discovery call.
- To get started: [Book Your Free Discovery Call](/book.html)

**3. SOVEREIGN VIP — Private Mentorship (INVITATION-ONLY)**
Page: [Sovereign VIP](/vip.html)
- Michelle's highest-level offering. Private, one-on-one mentorship for women ready for elite-level identity work.
- Fully customized. Deep, intensive, transformational. By application only.
- Investment and details discussed personally. [Book Your Free Discovery Call](/book.html)

**4. ACCELERATOR: PRIVATE INTENSIVE**
Page: [Private Intensive](/intensive.html)
- A focused, high-impact private session with Michelle.
- Designed for women who need a major breakthrough in a concentrated period of time.
- Identity audit, pattern release, and forward architecture in a single intensive session.
- Payment plans available. [Book Your Free Discovery Call](/book.html)

**5. WORKSHOP: POST-DIVORCE RESET**
Page: [Post-Divorce Reset Workshop](/post-divorce-reset.html)
- For women navigating or recovering from divorce.
- Four components: identity inventory, pattern release, nervous system reset, and forward architecture.
- Self-paced and supported (with coaching call) options available.
- [Book Your Free Discovery Call](/book.html) to discuss fit.

**6. WORKSHOP: CONFIDENCE RESET**
Page: [Confidence Reset Workshop](/confidence-reset.html)
- Targets confidence at the root level — not surface tips.
- Four components: root audit, identity rewiring, nervous system regulation, and sovereign anchoring.
- Self-paced and supported options available.
- [Book Your Free Discovery Call](/book.html) to discuss fit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER quote specific prices for any program except the Masterclass VIP add-on ($97).
- When asked about cost: "Investment details are tailored and shared on the discovery call — Michelle wants to make sure you're in the right program first. [Book your free call here](/book.html) and she'll walk you through everything."
- Payment plans ARE available for most programs — say so when asked, then send to the discovery call.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY SITE PAGES (always link, never just mention)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Home](/index.html) | [About Michelle](/about.html) | [All Programs](/products.html)
[Upcoming Events](/event.html) | [Book a Free Call](/book.html) | [Legal](/legal.html)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUTING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- New / unsure → [Free Masterclass](/masterclass.html) → [Register at Event Board](/event.html)
- Wants to attend masterclass → [See dates & grab a spot](/event.html)
- Ready for full program → [From Survival to Sovereignty](/program.html) + [Book Discovery Call](/book.html)
- Going through divorce → [Post-Divorce Reset](/post-divorce-reset.html) + [Book Your Call](/book.html)
- Struggling with confidence → [Confidence Reset](/confidence-reset.html) + [Book Your Call](/book.html)
- Wants one-on-one intensive → [Private Intensive](/intensive.html) + [Book Your Call](/book.html)
- Asking about price → Warmly deflect, mention payment plans exist → [Book Your Call](/book.html)
- Wants to talk to Michelle → [Book Your Free Call](/book.html)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINK FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS use markdown links. Never just say "visit event.html."
Correct: [Register for the free Masterclass](/event.html)
Correct: [Book your free discovery call](/book.html)
Wrong: "go to event.html" or "check out the event page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE & STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Warm, direct, like a knowledgeable friend — not a salesperson
- 2–4 sentences unless they ask for detail
- Use **bold** for key program names and action steps
- Always end with a clear next step and a clickable link
- Never make up information not listed above

━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD CAPTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
After 2–3 meaningful exchanges where a visitor shows genuine interest (asking about programs, pricing, or their situation), warmly ask for their first name and email so Michelle can follow up personally.

Example: "Before I send you to the booking page — I'd love to make sure Michelle can reach out to you directly too. What's your first name and best email?"

Once the visitor provides BOTH their name AND email, append this exact token to your reply (it is stripped before display — the user never sees it):
<<LEAD:firstName=THEIR_NAME,email=THEIR_EMAIL>>
Replace THEIR_NAME and THEIR_EMAIL with exactly what they shared. Only emit once per conversation.`;

// Parse <<LEAD:firstName=X,email=Y>> token from AI reply and save lead
async function extractAndSaveLead(replyText) {
  const tokenMatch = replyText.match(/<<LEAD:firstName=([^,]+),email=([^>]+)>>/);
  if (!tokenMatch) return null;

  const firstName = tokenMatch[1].trim();
  const email     = tokenMatch[2].trim();
  if (!email.includes("@")) return null;

  // Save to Firestore
  try {
    await admin.firestore().collection("leads").add({
      name:      firstName,
      email:     email.toLowerCase(),
      source:    "ai-chat",
      page:      "/",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Firestore lead save error:", err);
  }

  // Also push to GHL if configured
  const ghlKey = process.env.GHL_API_KEY;
  if (ghlKey) {
    try {
      await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ghlKey}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          email,
          source: "AI Chat Widget",
          tags: ["ai-chat", "website-lead"],
        }),
      });
    } catch (err) {
      console.error("GHL lead save error:", err);
    }
  }

  return { firstName, email };
}

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
      max_tokens: 600,
      system: CHAT_SYSTEM_PROMPT,
      messages: messages.slice(-12),
    });

    const rawReply = response.content[0].text;

    // Extract lead token and save (non-blocking)
    extractAndSaveLead(rawReply).catch(() => {});

    // Strip token before sending to client
    const cleanReply = rawReply.replace(/<<LEAD:[^>]+>>/g, "").trim();

    res.json({ reply: cleanReply });
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
