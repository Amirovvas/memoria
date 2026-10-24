import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { GiftSplash, GiftView } from "@/src/components/gift/GiftView"

export const metadata: Metadata = {
  title: { absolute: "Для тебя есть сюрприз 🎁" },
  description: "Открой — тут поздравление, фото и музыка",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: "#fdf4ec" }

/** The surprise page behind a gift's QR code. Public: the friend who scans it has no account. */
export default function Page({ params }: PageProps<"/g/[id]">) {
  return (
    <Suspense fallback={<GiftSplash />}>
      <Gift params={params} />
    </Suspense>
  )
}

async function Gift({ params }: Pick<PageProps<"/g/[id]">, "params">) {
  const { id } = await params
  return <GiftView id={id} />
}
