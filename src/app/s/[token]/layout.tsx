import AvisoSinInternet from "@/components/sinInternet/AvisoSinInternet";

/**
 * El culto compartido por enlace: sin cuenta, pero también se guarda al abrirlo
 * y se ve sin internet (O-96). Este layout solo pone el aviso de «copia
 * guardada»; sin sesión no hay botón de guardar ni refresco automático.
 */
export default function CultoCompartidoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AvisoSinInternet generado={new Date().toISOString()} />
    </>
  );
}
