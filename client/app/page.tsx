"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { socket } from "@/libs/socket";
import { Thread } from "@/types";
import { useAppContext } from "@/contexts/Context";

export default function Home() {
  const { userId, userName, userNameError, setUserNameError } = useAppContext();

  useEffect(() => {
    socket.on("new thread", (thread: string) => {
      console.log(thread);
      fetchThreads();
    });

    socket.on("delete thread", (thread: string) => {
      console.log(thread);
      fetchThreads();
    });

    fetchThreads();
  }, []);

  const [threads, setThreads] = useState<Thread[]>([]);

  // スレッド一覧を取得
  const fetchThreads = async () => {
    try {
      const threadsResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/thread/allThreads");
      const threads = await threadsResponse.json();
      setThreads(threads);
    } catch (error) {
      console.log(error);
    }
  };

  const [newThreadTitle, setNewThreadTitle] = useState<string>("");

  const createNewThread = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!newThreadTitle.match(/\S/g)) {
      return;
    }

    if (!userName) {
      setUserNameError(true);
      alert("ユーザー名を入力してください。");
      return;
    }

    setNewThreadTitle("");

    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/thread/newThread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newThreadTitle,
          user: {
            id: userId,
            name: userName,
          },
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteThread = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, threadId: string) => {
    e.preventDefault();

    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/thread/deleteThread/${threadId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 mx-2 sm:mx-8 md:mx-24 lg:mx-32 xl:mx-48">
      <NewThread newThreadTitle={newThreadTitle} setNewThreadTitle={setNewThreadTitle} createNewThread={createNewThread} />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl">
          スレッド一覧
        </h1>
        <div>
          {threads.sort((a, b) => - a.createdAt.seconds + b.createdAt.seconds).map((thread: Thread) => (
            <Link href={"/thread/" + thread.id} key={thread.id} className="flex justify-between p-1 my-2 border">
              <div className="w-[calc(100%-45px)]">
                <div>
                  {thread.user.name}&nbsp;
                  <span className="text-sm text-gray-500">
                    {new Date(thread.createdAt.seconds * 1000).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).replace(":", "時").replace(":", "分") + "秒"}
                    {thread.updatedAt?.seconds && (
                      "（最終投稿：" +
                      new Date(thread.updatedAt.seconds * 1000).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).replace(":", "時").replace(":", "分") + "秒"
                      + "）"
                    )}
                  </span>
                </div>
                <div className="text-blue-500">
                  {thread.title}
                </div>
              </div>
              {thread.user.id === userId && (
                <div className="flex items-center">
                  <button onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => deleteThread(e, thread.id)} className="p-1 bg-red-500 text-white">
                    削除
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
      <NewThread newThreadTitle={newThreadTitle} setNewThreadTitle={setNewThreadTitle} createNewThread={createNewThread} />
    </div>
  );
}

const NewThread = ({ newThreadTitle, setNewThreadTitle, createNewThread }: {
  newThreadTitle: string;
  setNewThreadTitle: React.Dispatch<React.SetStateAction<string>>;
  createNewThread: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
}) => {
  return (
    <div>
      <h1 className="text-xl">
        新しいスレッドを立てる
      </h1>
      <form>
        <input
          type="text"
          value={newThreadTitle}
          placeholder="タイトルを入力"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewThreadTitle(e.target.value)}
          className="w-[calc(100%-42px)] min-w-60 h-8 p-1 border bg-gray-200"
        />
        <button type="submit" onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => createNewThread(e)} className="h-8 p-1 border">
          作成
        </button>
      </form>
    </div>
  );
};
