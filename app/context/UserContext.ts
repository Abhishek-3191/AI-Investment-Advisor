import { createContext } from "react";

export const UserContext = createContext<{
  userDetail: any;
  setUserDetail: (data: any) => void;
} | null>(null);
