const DEFAULT_ALLOWED_EMAILS = [
  "angelcelada@gmail.com",
  "angelcelada@outlook.com",
  "acelada64@gmail.com",
];

export function isAdminAllowed(email: string | null | undefined) {
  if (!email) return false;

  const configured = (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const allowed = configured.length > 0 ? configured : DEFAULT_ALLOWED_EMAILS;

  return allowed.includes(email.toLowerCase());
}
