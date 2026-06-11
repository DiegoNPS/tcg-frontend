import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { TiendaForm } from "@/components/forms/tienda-form";

export const metadata = {
  title: "Crear tienda",
};

export default async function CrearTiendaPage() {
  // Cualquier usuario autenticado puede crear una tienda.
  await requireAuthenticatedUser("/tienda/crear");

  return (
    <main className="ui-shell flex flex-1 flex-col py-10">
      <header className="ui-card mb-6 rounded-lg p-5 sm:p-6">
        <p className="ui-eyebrow">Tienda</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Crear tu tienda</h1>
        <p className="text-sm text-zinc-600">Crea una tienda para publicar torneos y gestionar tu panel.</p>
      </header>

      <TiendaForm />
    </main>
  );
}
