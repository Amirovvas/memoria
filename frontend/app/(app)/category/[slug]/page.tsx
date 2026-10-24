import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { TemplateGallery } from "@/src/components/templates/TemplateGallery"
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/src/lib/catalog"

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: CATEGORY_BY_SLUG[slug]?.name ?? "Категория" }
}

async function Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!CATEGORY_BY_SLUG[slug]) notFound()
  return <TemplateGallery key={slug} category={slug} />
}

export default function Page({ params }: PageProps<"/category/[slug]">) {
  return (
    <Suspense fallback={<div className="skeleton mx-4 mt-4 h-[280px] rounded-[28px] sm:mx-6 lg:mx-10" />}>
      <Category params={params} />
    </Suspense>
  )
}
