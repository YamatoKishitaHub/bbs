"use server";

import { cookies } from "next/headers";

import { v4 as uuidv4 } from "uuid";

export const getUserId = () => {
  const hasUserId = cookies().has("userId");

  if (hasUserId) {
    const userId = cookies().get("userId");
    return userId!.value;
  } else {
    const newUserId = uuidv4();
    cookies().set("userId", newUserId);
    return newUserId;
  }
};

export const getUserName = () => {
  const hasUserName = cookies().has("userName");

  if (hasUserName) {
    const userName = cookies().get("userName");
    return userName!.value;
  } else {
    return "";
  }
};

export const setUserName = (userName: string) => {
  cookies().set("userName", userName);
};
