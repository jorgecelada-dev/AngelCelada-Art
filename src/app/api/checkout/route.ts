import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const { obraId } = await request.json();

  if (!obraId) {
    return NextResponse.json({ error: "Falta obraId" }, { status: 400 });
  }

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!supabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Supabase no está configurado todavía. Añade NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY para habilitar el checkout.",
      },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const stripeClient = getStripeClient();

  if (!stripeClient) {
    return NextResponse.json(
      {
        error:
          "Stripe no está configurado todavía. Añade STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET para habilitar el checkout.",
      },
      { status: 503 }
    );
  }

  const { data: obra, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", obraId)
    .single();

  if (error || !obra) {
    return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 });
  }

  if (!obra.disponible) {
    return NextResponse.json({ error: "Esta obra ya no está disponible" }, {
      status: 409,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    // Bizum se activa desde el Dashboard de Stripe (Settings > Payment
    // methods) para cuentas en España; Stripe lo añade automáticamente a
    // este listado de payment_method_types si está habilitado en tu cuenta.
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: obra.titulo,
            images: obra.imagen_url ? [obra.imagen_url] : undefined,
          },
          unit_amount: Math.round(obra.precio * 100),
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: {
      allowed_countries: ["ES", "PT", "FR", "DE", "IT"],
    },
    success_url: `${siteUrl}/obras/${obra.id}?compra=exito`,
    cancel_url: `${siteUrl}/obras/${obra.id}?compra=cancelada`,
    metadata: {
      obra_id: obra.id,
    },
  });

  // Guardamos un pedido "pendiente" para poder hacer seguimiento aunque el
  // webhook tarde en llegar.
  await supabase.from("pedidos").insert({
    obra_id: obra.id,
    stripe_session_id: session.id,
    importe: obra.precio,
    estado: "pendiente",
  });

  return NextResponse.json({ url: session.url });
}
