import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
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

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
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

    await supabase
      .from("pedidos")
      .update({
        estado: "pagado",
        comprador_email: session.customer_details?.email ?? null,
        comprador_nombre: session.customer_details?.name ?? null,
        direccion_envio: session.customer_details?.address ?? null,
      })
      .eq("stripe_session_id", session.id);

    if (obraId) {
      await supabase
        .from("obras")
        .update({ disponible: false })
        .eq("id", obraId);
    }
  }

  return NextResponse.json({ received: true });
}
