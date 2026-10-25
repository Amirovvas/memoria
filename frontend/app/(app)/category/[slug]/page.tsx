import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { TemplateGallery } from "@/src/components/templates/TemplateGallery"
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/src/lib/catalog"
import s from "./page.module.css"

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
    <Suspense fallback={<div className={`skeleton ${s.fallback}`} />}>
      <Category params={params} />
    </Suspense>
  )
}
