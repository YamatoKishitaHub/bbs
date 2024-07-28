"use client";

import { createContext, useContext, useState } from "react";

type AppContext = {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  userNameError: boolean;
  setUserNameError: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultAppContext: AppContext = {
  userId: "",
  setUserId: () => {},
  userName: "",
  setUserName: () => {},
  userNameError: false,
  setUserNameError: () => {},
};

export const AppContext = createContext<AppContext>(defaultAppContext);

type AppContextProvider = {
  children: React.ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProvider)  => {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userNameError, setUserNameError] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{ userId, setUserId, userName, setUserName, userNameError, setUserNameError }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
