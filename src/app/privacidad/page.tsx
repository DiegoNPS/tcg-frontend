import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <main className="ui-shell flex-1 py-10 sm:py-14">
      <article className="max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="ui-eyebrow">Información legal</p>
          <h1 className="text-balance text-3xl font-black text-zinc-900 sm:text-4xl">Política de privacidad</h1>
          <p className="text-sm text-zinc-600">Última actualización: 22 de junio de 2026.</p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-zinc-600">
          <section><h2 className="text-lg font-semibold text-zinc-900">Datos que tratamos</h2><p className="mt-2">Podemos tratar datos de cuenta, perfil, contacto, ubicación proporcionada, tiendas, eventos e inscripciones. Si eliges autenticación externa, recibimos la información necesaria para identificar tu cuenta.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Finalidades</h2><p className="mt-2">Usamos estos datos para autenticar usuarios, mostrar eventos, gestionar inscripciones, operar perfiles y tiendas, prevenir abuso y mejorar la seguridad y funcionamiento de la plataforma.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Proveedores</h2><p className="mt-2">La plataforma utiliza Supabase para autenticación y persistencia. Algunas funciones pueden utilizar Google para autenticación, mapas o autocompletado de direcciones. Cada proveedor aplica sus propias condiciones de tratamiento.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Conservación y derechos</h2><p className="mt-2">Conservamos la información mientras la cuenta esté activa o sea necesaria para operar el servicio y cumplir obligaciones. Puedes solicitar acceso, corrección o eliminación mediante el canal de soporte comunicado por el operador.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-900">Seguridad</h2><p className="mt-2">Aplicamos controles técnicos y de acceso para reducir riesgos, aunque ningún sistema conectado a internet puede garantizar seguridad absoluta.</p></section>
        </div>

        <p className="ui-alert ui-alert-warning">Esta política debe recibir revisión legal y completar el canal formal de contacto antes del lanzamiento comercial.</p>
      </article>
    </main>
  );
}
