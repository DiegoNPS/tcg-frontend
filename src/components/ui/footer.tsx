import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[rgba(8,12,18,0.72)]">
      <div className="ui-shell flex flex-col gap-3 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} TCG Tournaments</p>
        <nav aria-label="Información legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/terminos" className="min-h-11 content-center underline-offset-4 hover:text-white hover:underline">
            Términos y condiciones
          </Link>
          <Link href="/privacidad" className="min-h-11 content-center underline-offset-4 hover:text-white hover:underline">
            Política de privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
