"use client";

import { useEffect, useState } from "react";

import { useAppContext } from "@/contexts/Context";
import { getUserId, getUserName, setUserName as setUserNameToCookie } from "@/utils/useUserInfo";

const UserInfo = () => {
  const { userId, setUserId, userName, setUserName, userNameError, setUserNameError } = useAppContext();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getUserId();
        setUserId(userId);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserId();

    const fetchUserName = async () => {
      try {
        const userName = await getUserName();
        if (userName) {
          setUserName(userName);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserName();
  }, [setUserId, setUserName]);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tmpUserName, setTmpUserName] = useState<string>("");

  // コメントを編集できる状態にする
  const handleSetUserNamePreparation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setIsEditing(true);
    setTmpUserName(userName);
  };

  const handleSetUserName = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!tmpUserName.match(/\S/g)) {
      return;
    }

    setUserName(tmpUserName);
    setUserNameToCookie(tmpUserName);
    setIsEditing(false);
    setTmpUserName("");
    setUserNameError(false);
  };

  return (
    <div className="my-2 mx-2 sm:mx-8 md:mx-24 lg:mx-32 xl:mx-48">
      <div className="p-1 border">
        ID：{userId}
      </div>
      <form className="flex justify-between p-1 border">
        ユーザー名：
        {!userName || isEditing ? (
          <input
            type="text"
            value={tmpUserName}
            placeholder="新しいユーザー名を入力"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTmpUserName(e.target.value)}
            className={`w-[calc(100%-150px)] h-8 p-1 border ${userNameError && "border-red-500"} bg-gray-200`}
          />
        ) : (
          userName
        )}
        {!userName || isEditing ? (
          <button onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleSetUserName(e)} className="p-1 bg-blue-500 text-white">
            確定
          </button>
        ) : (
          <button onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleSetUserNamePreparation(e)} className="p-1 bg-blue-500 text-white">
            編集
          </button>
        )}
      </form>
    </div>
  );
};

export default UserInfo;
