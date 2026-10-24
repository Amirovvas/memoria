import Link from "next/link"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Ошибка 404</p>
        <h1 className="display mt-3 text-6xl">Страница потерялась</h1>
        <p className="mt-3 text-muted">Возможно, её унесло ветром вместе со старыми фотографиями.</p>
        <Link href="/" className="btn btn-primary mt-8">
          На главную
        </Link>
      </div>
    </main>
  )
}
