import Link from "next/link"
import s from "./not-found.module.css"

export default function NotFound() {
  return (
    <main className={s.page}>
      <div>
        <p className="eyebrow">Ошибка 404</p>
        <h1 className={`display ${s.title}`}>Страница потерялась</h1>
        <p className={s.text}>Возможно, её унесло ветром вместе со старыми фотографиями.</p>
        <Link href="/" className={`btn btn-primary ${s.action}`}>
          На главную
        </Link>
      </div>
    </main>
  )
}
