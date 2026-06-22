import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <main className="ui-shell flex-1 py-10 sm:py-14">
      <article className="max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="ui-eyebrow">Información legal</p>
          <h1 className="text-balance text-3xl font-black text-zinc-900 sm:text-4xl">Términos y condiciones</h1>
          <p className="text-sm text-zinc-600">Última actualización: 22 de junio de 2026.</p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-zinc-600">
          <section><h2 className="text-lg font-semibold text-zinc-900">Uso de la plataforma</h2><p className="mt-2">TCG Tournaments conecta jugadores y tiendas para publicar, descubrir y gestionar torneos. Debes proporcionar información veraz, proteger el acceso a tu cuenta y utilizar el servicio de forma lícita.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Eventos e inscripciones</h2><p className="mt-2">Cada tienda es responsable de la información, cupos, costos, ubicación y ejecución de sus eventos. Los jugadores deben revisar esas condiciones antes de inscribirse y respetar las reglas comunicadas por la organización.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Contenido y conducta</h2><p className="mt-2">No se permite publicar contenido engañoso, ilegal, abusivo o que vulnere derechos de terceros. Podemos restringir cuentas o publicaciones cuando sea necesario para proteger a la comunidad y la operación del servicio.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Disponibilidad</h2><p className="mt-2">Trabajamos para mantener la plataforma disponible, pero pueden existir interrupciones por mantenimiento, proveedores externos o causas fuera de nuestro control.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Privacidad</h2><p className="mt-2">El tratamiento de datos personales se describe en nuestra <Link href="/privacidad" className="font-semibold text-[var(--accent)] underline underline-offset-4">Política de privacidad</Link>.</p></section>
        </div>

        <p className="ui-alert ui-alert-warning">Este documento debe recibir revisión legal antes de un lanzamiento comercial definitivo.</p>
      </article>
    </main>
  );
}
