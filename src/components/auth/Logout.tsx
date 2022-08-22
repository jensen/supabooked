import { useUser } from "~/context/user";

export default function Logout() {
  const { logout } = useUser();

  return (
    <button
      className="bg-discord-blue hover:bg-discord-blue/60 px-4 py-1 rounded flex items-center"
      onClick={logout}
    >
      <span className="text-sm text-white font-bold">Logout</span>
    </button>
  );
}
