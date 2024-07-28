"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { socket } from "@/libs/socket";
import { Comment } from "@/types";
import { useAppContext } from "@/contexts/Context";

const Thread = () => {
  const params = useParams();

  const { userId, userName, setUserNameError } = useAppContext();

  const [title, setTitle] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchThread = useCallback(async () => {
    try {
      const threadResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/thread/thread/${params.id}`);
      const thread = await threadResponse.json();
      setTitle(thread.title);
      setComments(thread.comments);
      document.title = thread.title + " | 掲示板サイト";
    } catch (error) {
      console.log(error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchThread();

    socket.on("new comment", (comment: string) => {
      console.log(comment);
      fetchThread();
    });

    socket.on("edit comment", (comment: string) => {
      console.log(comment);
      fetchThread();
    });

    socket.on("delete comment", (comment: string) => {
      console.log(comment);
      fetchThread();
    });
  }, [fetchThread]);

  const [newComment, setNewComment] = useState<string>("");

  const createNewComment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!newComment.match(/\S/g)) {
      return;
    }

    if (!userName) {
      setUserNameError(true);
      alert("ユーザー名を入力してください。");
      return;
    }

    setNewComment("");

    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/thread/newComment/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: {
            text: newComment,
            user: {
              id: userId,
              name: userName,
            },
            isDeleted: false,
          },
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const [isEditing, setIsEditing] = useState<number>();
  const [editingComment, setEditingComment] = useState<string>("");

  // コメントを編集できる状態にする
  const editCommentPreparation = (index: number) => {
    setIsEditing(index);
    setEditingComment(comments[index].text);
  };

  const editComment = async (index:number) => {
    socket.emit("edit comment", "edit comment");
    setIsEditing(-1);
    setEditingComment("");

    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/thread/editComment/${params.id}/${index}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          editedComment: editingComment,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteComment = async (index: number) => {
    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/thread/deleteComment/${params.id}/${index}`, {
        method: "PATCH",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 mx-2 sm:mx-8 md:mx-24 lg:mx-32 xl:mx-48">
      <div>
        <Link href="../.." className="text-blue-500">
          &lt; ホームに戻る
        </Link>
      </div>
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl">
          {title}
        </h1>
        <div>
          {comments.map((comment: Comment, index: number) => (
            <div key={comment.user.id + comment.user.name + comment.text + comment.createdAt.seconds} className="flex justify-between p-1 my-2 border">
              <div className="w-[calc(100%-50px)] md:w-[calc(100%-90px)]">
                <div>
                  {comment.user.name}&nbsp;
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt.seconds * 1000).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).replace(":", "時").replace(":", "分") + "秒"}
                    {comment.createdAt.seconds !== comment.updatedAt.seconds && (
                      "（最終編集：" + (
                        new Date(comment.updatedAt.seconds * 1000).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).replace(":", "時").replace(":", "分") + "秒"
                      ) + "）"
                    )}
                  </span>
                </div>
                <div>
                  {comment.isDeleted ? (
                    <span className="text-gray-500">
                      このコメントは削除されました。
                    </span>
                  ) : (
                    isEditing === index ? (
                      <form onSubmit={() => editComment(index)}>
                        <input
                          type="text"
                          value={editingComment}
                          placeholder="コメントを編集"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingComment(e.target.value)}
                          className="w-full p-1 border bg-gray-200"
                        />
                      </form>
                    ) : comment.text
                  )}
                </div>
              </div>
              {comment.user.id === userId && (
                <div className="flex flex-col md:flex-row items-center gap-1">
                  {isEditing === index ? (
                    <button onClick={() => editComment(index)} className={`p-1 bg-blue-500 text-white ${comment.isDeleted && "opacity-50"}`} disabled={comment.isDeleted}>
                      確定
                    </button>
                  ) : (
                    <button onClick={() => editCommentPreparation(index)} className={`p-1 bg-blue-500 text-white ${comment.isDeleted && "opacity-50"}`} disabled={comment.isDeleted}>
                      編集
                    </button>
                  )}
                  <button onClick={() => deleteComment(index)} className={`p-1 bg-red-500 text-white ${comment.isDeleted && "opacity-50"}`} disabled={comment.isDeleted}>
                    削除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-xl">
          新しいコメントをする
        </h1>
        <form>
          <input
            type="text"
            value={newComment}
            placeholder="コメントを入力"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
            className="w-[calc(100%-42px)] min-w-60 p-1 border bg-gray-200"
          />
          <button type="submit" onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => createNewComment(e)} className="h-8 p-1 border">
            送信
          </button>
        </form>
      </div>
      <div>
        <Link href="../.." className="text-blue-500">
          &lt; ホームに戻る
        </Link>
      </div>
    </div>
  );
};

export default Thread;
