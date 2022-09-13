import type { PresenceState } from "@supabase/realtime-js/dist/module/RealtimePresence";
import { useContext, createContext, useEffect, useState } from "react";
import supabaseClient from "~/services/supabase";
import { useUser } from "~/context/user";

interface IStatusContext {
  onlineUsers: any[];
}

const StatusContext = createContext<IStatusContext>({
  onlineUsers: [],
});

interface Props {}

export default function StatusProvider(props: React.PropsWithChildren<Props>) {
  const { user, supabaseClient } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabaseClient
      .channel("online-users")
      .on("presence", { event: "join" }, (payload: PresenceState) => {
        const idsToAdd = payload.newPresences.map((p) => p.user as string);

        setOnlineUsers((prev) => Array.from(new Set([...prev, ...idsToAdd])));
      })
      .on("presence", { event: "leave" }, (payload: PresenceState) => {
        const idsToRemove = payload.leftPresences.map((p) => p.user as string);

        setOnlineUsers((prev) =>
          Array.from(
            new Set(prev.filter((id) => idsToRemove.includes(id) === false))
          )
        );
      })
      .subscribe(async (status: "SUBSCRIBED") => {
        if (status === "SUBSCRIBED") {
          if (user) {
            await channel.track({ user: user.id });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabaseClient]);

  return (
    <StatusContext.Provider
      value={{
        onlineUsers,
      }}
    >
      {props.children}
    </StatusContext.Provider>
  );
}

export const useStatus = () => useContext(StatusContext);
