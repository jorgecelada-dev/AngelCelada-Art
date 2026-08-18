// Objetos de referencia con medida real conocida y consistente, para
// reducir el error de "¿cuánto medía realmente aquello?" al calibrar la
// escala de una foto (en vez de confiar en la memoria sobre un objeto
// cualquiera de la foto).
export const OBJETOS_REFERENCIA = [
  { label: "Interruptor / enchufe de pared", cm: 8 },
  { label: "Ancho de una puerta interior", cm: 80 },
  { label: "Folio A4 (lado largo)", cm: 29.7 },
  { label: "Ladrillo visto (lado largo)", cm: 24 },
  { label: "Baldosa de suelo típica", cm: 60 },
  { label: "Otro objeto (medida personalizada)", cm: null },
] as const;
