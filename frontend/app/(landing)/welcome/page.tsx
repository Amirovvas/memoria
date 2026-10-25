import type { Metadata } from "next"
import { Landing } from "@/src/components/landing/Landing"

export const metadata: Metadata = {
  title: { absolute: "Memoria — фотоколлажи и подарки с QR-кодом" },
  description:
    "Соберите фотографии в коллаж за пару минут, распечатайте его или превратите в подарок-сюрприз с QR-кодом, музыкой и поздравлением.",
}

/** Guests who open "/" land here (proxy.ts rewrites the request); the address bar keeps "/". */
export default function Page() {
  return <Landing />
}
