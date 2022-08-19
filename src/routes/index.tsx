import DiscordLogin from "~/components/auth/DiscordLogin";
import Logout from "~/components/auth/Logout";
import { useUser } from "~/context/user";

export default function Index() {
  const { isAuthenticated } = useUser();

  return (
    <div className="h-full flex justify-center items-center">
      {isAuthenticated ? <Logout /> : <DiscordLogin />}
    </div>
  );
}
