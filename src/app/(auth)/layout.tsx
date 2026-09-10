import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-8">
          {/* El LOGO de la iglesia (O-76). Isaac, 2026-09-10: «en vez de ese
              icono de signo musical que coloques el logotipo de la iglesia».
              Es el mismo archivo que el icono de la app instalada (O-15), así
              que no entra ninguna imagen nueva en el repositorio. Pasa sin
              sesión porque el middleware deja fuera los `.png`.
              `unoptimized`: se sirve tal cual desde `public/`, sin pasar por
              el optimizador de imágenes de Vercel, que no hace falta aquí. */}
          <Image
            src="/icon-192.png"
            alt="Centro Cristiano La Casa de mi Padre"
            width={96}
            height={96}
            priority
            unoptimized
            className="mx-auto mb-4 h-24 w-24 rounded-full shadow-lg shadow-black/30"
          />
          <h1 className="font-display text-2xl font-bold text-white">Partituras</h1>
          <p className="text-brand-200 text-sm mt-1">Centro Cristiano La Casa de mi Padre</p>
        </div>
        {children}
      </div>
    </div>
  );
}
