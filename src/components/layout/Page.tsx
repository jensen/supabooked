import { Outlet, Link } from "@remix-run/react";
import DiscordLogin from "~/components/auth/DiscordLogin";
import Logout from "~/components/auth/Logout";
import { useUser } from "~/context/user";

export default function PageLayout() {
  const { isAuthenticated } = useUser();

  return (
    <main className="h-full flex flex-col items-center">
      <header className="w-full p-4 bg-available border-b border-border flex justify-between items-center">
        <span className="font-bold text-lg tracking-wider">
          <Link to="/">
            <span className="font-light">supa</span>booked
          </Link>
        </span>
        {isAuthenticated ? <Logout /> : <DiscordLogin />}
      </header>
      <section className="flex-grow p-4 pt-12 overflow-y-auto w-9/12">
        <Outlet />
      </section>
      <footer className="w-full p-4 border-t border-border">
        <span className="font-light">by</span>{" "}
        <a
          href="https://github.com/jensen"
          className="font-bold tracking-wide hover:text-red-400"
        >
          @jensen
        </a>
      </footer>
    </main>
  );
}
