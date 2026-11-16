const checkoutPath = "/api/checkout";
const stripeApiVersion = "2026-03-25.dahlia";

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function getCorsHeaders(origin, siteOrigin) {
  if (origin !== siteOrigin) return {};
  return {
    "Access-Control-Allow-Origin": siteOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function getConfiguredPrices(env) {
  return new Map(
    Object.entries(env)
      .filter(
        ([key, value]) =>
          /^PRICE_[A-Z0-9_]+$/.test(key) &&
          /^price_[A-Za-z0-9]+$/.test(value || ""),
      )
      .map(([key, value]) => [
        key.slice("PRICE_".length).toLowerCase().replace(/_/g, "-"),
        value,
      ]),
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin, env.SITE_ORIGIN);

    if (url.pathname !== checkoutPath) {
      return new Response("Not found", { status: 404 });
    }
    if (request.method === "OPTIONS") {
      return origin === env.SITE_ORIGIN
        ? new Response(null, { status: 204, headers: corsHeaders })
        : new Response("Forbidden", { status: 403 });
    }
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Method not allowed." },
        405,
        { ...corsHeaders, Allow: "POST, OPTIONS" },
      );
    }
    if (origin !== env.SITE_ORIGIN) {
      return jsonResponse({ error: "Origin not allowed." }, 403, corsHeaders);
    }

    const secretMode = /^sk_(test|live)_[A-Za-z0-9]+$/.exec(
      env.STRIPE_SECRET_KEY || "",
    )?.[1];
    const publishableMode = /^pk_(test|live)_[A-Za-z0-9]+$/.exec(
      env.STRIPE_PUBLISHABLE_KEY || "",
    )?.[1];
    const configuredPrices = getConfiguredPrices(env);
    if (!secretMode || secretMode !== publishableMode || !configuredPrices.size) {
      console.error("Stripe Worker configuration is incomplete or inconsistent.");
      return jsonResponse(
        { error: "Checkout is not configured. Please try again later." },
        503,
        corsHeaders,
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid cart data." }, 400, corsHeaders);
    }

    if (
      !requestBody ||
      !Array.isArray(requestBody.items) ||
      requestBody.items.length < 1 ||
      requestBody.items.length > 100
    ) {
      return jsonResponse({ error: "Your basket is empty or invalid." }, 400, corsHeaders);
    }

    const quantities = new Map();
    for (const item of requestBody.items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !/^[a-z0-9-]+$/.test(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return jsonResponse({ error: "Your basket contains an invalid item." }, 400, corsHeaders);
      }

      if (!configuredPrices.has(item.productId)) {
        return jsonResponse(
          { error: "Your basket contains a product that is not configured for checkout." },
          400,
          corsHeaders,
        );
      }
      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) + item.quantity,
      );
      if (quantities.get(item.productId) > 99) {
        return jsonResponse(
          { error: "The maximum quantity of a product is 99." },
          400,
          corsHeaders,
        );
      }
    }

    const sessionParams = new URLSearchParams({
      mode: "payment",
      ui_mode: "hosted_page",
      success_url: `${env.SITE_ORIGIN}/success/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.SITE_ORIGIN}/cancelled/index.html`,
      billing_address_collection: "required",
      "phone_number_collection[enabled]": "false",
      "automatic_tax[enabled]": "false",
      submit_type: "auto",
      "shipping_address_collection[allowed_countries][0]": "GB",
      "saved_payment_method_options[payment_method_save]": "enabled",
      integration_identifier: "custom_embedded_web_0001",
    });

    let index = 0;
    for (const [productId, quantity] of quantities) {
      sessionParams.set(
        `line_items[${index}][price]`,
        configuredPrices.get(productId),
      );
      sessionParams.set(`line_items[${index}][quantity]`, String(quantity));
      index += 1;
    }

    try {
      const stripeResponse = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Stripe-Version": stripeApiVersion,
          },
          body: sessionParams,
        },
      );
      const session = await stripeResponse.json();
      if (!stripeResponse.ok) {
        const stripeError = session.error;
        const errorDetails = {
          type: stripeError?.type,
          code: stripeError?.code,
          param: stripeError?.param,
          message: stripeError?.message,
        };
        console.error(
          "Stripe Checkout Session creation failed.",
          stripeResponse.status,
          errorDetails,
        );
        const errorMessage =
          secretMode === "test" && typeof stripeError?.message === "string"
            ? `Stripe test error (${stripeError.code || stripeError.type || stripeResponse.status}): ${stripeError.message}`
            : "Stripe could not create a checkout session. Please try again.";
        return jsonResponse(
          { error: errorMessage },
          502,
          corsHeaders,
        );
      }
      if (
        typeof session.url !== "string" ||
        !session.url.startsWith("https://checkout.stripe.com/")
      ) {
        console.error("Stripe returned a Checkout Session without a valid URL.");
        return jsonResponse(
          { error: "Stripe returned an incomplete checkout session." },
          502,
          corsHeaders,
        );
      }

      return jsonResponse({ url: session.url }, 200, corsHeaders);
    } catch (error) {
      console.error("Could not reach Stripe to create a Checkout Session.", error);
      return jsonResponse(
        { error: "The checkout service could not reach Stripe. Please try again." },
        502,
        corsHeaders,
      );
    }
  },
};
