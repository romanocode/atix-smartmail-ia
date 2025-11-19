import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/logo-atix.svg"
              alt="Atix"
              width={112}
              height={47}
              onError={(e) => {
                const fallback =
                  "data:image/svg+xml,%3Csvg%20width%3D%27112%27%20height%3D%2747%27%20viewBox%3D%270%200%20112%2047%27%20fill%3D%27none%27%20xmlns%3D%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M33.1922%2033.9984L37.3746%2046.3845H44.7302L31.2327%206.49152C29.9604%202.74789%2026.4508%200.217957%2022.4878%200.217957C18.5394%200.217957%2015.0152%202.73327%2013.7429%206.49152L0.245361%2046.3845H7.39628L11.5786%2033.9984H33.163H33.1922ZM20.7037%207.12032H24.0964L31.1011%2027.8272H13.699L20.7037%207.12032Z%27%20fill%3D%27%236A66FF%27%2F%3E%3Cpath%20d%3D%27M61.0794%2019.4918V13.3061H52.7586V4.72205H45.7977V35.8702C45.7977%2041.6758%2050.5065%2046.3845%2056.3121%2046.3845H61.094V40.1988H52.7732V19.4918H61.094H61.0794Z%27%20fill%3D%27%236A66FF%27%2F%3E%3Cpath%20d%3D%2772.515%200.802948H65.5542V8.11473H72.515V0.802948Z%27%20fill%3D%27%236A66FF%27%2F%3E%3Cpath%20d%3D%2772.515%2013.3207H65.5542V46.3846H72.515V13.3207Z%27%20fill%3D%27%236A66FF%27%2F%3E%3Cpath%20d%3D%2784.828%2013.3207H76.7266L86.773%2029.8599L76.7266%2046.3992H84.828L91.2624%2035.9433C93.5583%2032.2143%2093.5583%2027.5055%2091.2624%2023.7765L84.828%2013.3207Z%27%20fill%3D%27%236A66FF%27%2F%3E%3Cpath%20d%3D%27111.882%2013.3207H103.78L97.3458%2023.7765C95.0499%2027.5055%2095.0499%2032.2143%2097.3458%2035.9433L103.78%2046.3992H111.882L101.835%2029.8599L111.882%2013.3207Z%27%20fill%3D%27%236A66FF%27%2F%3E%3C%2Fsvg%3E";
                (e.currentTarget as HTMLImageElement).src = fallback;
              }}
            />
          </Link>

        

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:inline-flex">
                Conectar cuenta
              </Button>
            </Link>
            {isHome && (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Ir al Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
