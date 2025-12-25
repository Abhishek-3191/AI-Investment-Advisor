"use client";

import { UserContext } from "./context/UserContext";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

export default function AIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const saveUser = useMutation(api.users.createUserIfNotExists);

  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      const result = await saveUser({
        name: user.fullName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
      });

      setUserDetail(result);
    };

    syncUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserContext.Provider>
  );
}
