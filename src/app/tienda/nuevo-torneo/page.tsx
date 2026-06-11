import { requireStore } from "@/lib/auth/guards";
import { TorneoForm } from "@/components/forms/torneo-form";

export default async function NuevoTorneoPage() {
  // Solo tiendas pueden crear torneos
  await requireStore();

  return (
    <main className="ui-shell flex flex-1 flex-col gap-6 py-10">
      <header className="ui-card rounded-lg p-5 sm:p-6">
        <p className="ui-eyebrow">Tienda</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Publicar torneo</h1>
        <p className="text-sm text-zinc-600">
          Completa los datos del evento. El torneo aparecera en la home publica al publicarlo!.
        </p>
      </header>

      <TorneoForm />
    </main>
  );
}
