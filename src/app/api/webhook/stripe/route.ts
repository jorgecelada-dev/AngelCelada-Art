import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// Este endpoint recibe los eventos de Stripe cuando un pago se completa.
// En local, pruébalo con la Stripe CLI:
//   stripe listen --forward-to localhost:3000/api/webhook/stripe
// En producción, configúralo en dashboard.stripe.com > Developers > Webhooks
// apuntando a https://tu-dominio.com/api/webhook/stripe

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  const stripeClient = getStripeClient();

  if (!stripeClient) {
    return NextResponse.json(
      {
        error:
          "Stripe no está configurado todavía. Añade STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET para recibir eventos del webhook.",
      },
      { status: 503 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Firma de webhook inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const obraId = session.metadata?.obra_id;
    const tipo = session.metadata?.tipo === "lamina" ? "lamina" : "original";

    await supabase
      .from("pedidos")
      .update({
        estado: "pagado",
        comprador_email: session.customer_details?.email ?? null,
        comprador_nombre: session.customer_details?.name ?? null,
        direccion_envio: session.customer_details?.address ?? null,
      })
      .eq("stripe_session_id", session.id);

    // Una lámina es una copia impresa: comprarla no agota el original.
    if (obraId && tipo === "original") {
      await supabase
        .from("obras")
        .update({ disponible: false, estado: "vendido" })
        .eq("id", obraId);
    }
  }

  return NextResponse.json({ received: true });
}
