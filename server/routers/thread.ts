import express from "express";
import type { Request, Response, Router } from "express";
import { collection, addDoc, getDocs, query, where, doc, documentId, updateDoc, deleteDoc } from 'firebase/firestore';

import { db } from "../lib/firebase";
import { Thread, Comment, User } from "../types";
import { io } from "../server";

const router: Router = express.Router();

// スレッド一覧を取得
router.get("/allThreads", async (req: Request, res: Response) => {
  try {
    const threads: Thread[] = [];

    const querySnapshot = await getDocs(collection(db, 'threads'));

    querySnapshot.forEach((doc) => {
      threads.push({
        id: doc.id,
        title: doc.data().title,
        comments: doc.data().comments,
        user: doc.data().user,
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt,
      });
    });

    res.json(threads);
  } catch (error) {
    console.error("Error fetching threads: ", error);
    res.status(500).json({ error });
  }
});

// スレッドを取得
router.get("/thread/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    let thread: Thread = {
      id: "",
      title: "",
      comments: [],
      user: {
        id: "",
        name: "",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const q = query(collection(db, "threads"), where(documentId(), "==", id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      thread.title = doc.data().title;
      thread.comments = doc.data().comments;
      thread.user = doc.data().user;
      thread.createdAt = doc.data().createdAt;
      thread.updatedAt = doc.data().updatedAt;
    });

    res.json(thread);
  } catch (error) {
    console.error("Error fetching thread: ", error);
    res.status(500).json({ error });
  }
});

// 新しいスレッドを追加
router.post("/newThread", async (req: Request, res: Response) => {
  try {
    const { title, user }: {
      title: string;
      user: User;
    } = req.body;

    await addDoc(collection(db, "threads"), {
      title,
      comments: [],
      user,
      createdAt: new Date(),
    });

    io.emit("new thread", "created new thread");
  } catch (error) {
    console.error("Error creating thread: ", error);
    res.status(500).json({ error });
  }
});

// コメントを追加
router.post("/newComment/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    let { comment }: {
      comment: Comment;
    } = req.body;

    comment.createdAt = new Date();
    comment.updatedAt = new Date();

    let comments: Comment[] = [];

    const q = query(collection(db, "threads"), where(documentId(), "==", id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      comments = doc.data().comments;
    });

    await updateDoc(doc(db, "threads", id), {
      comments: [...comments, comment],
      updatedAt: new Date(),
    });

    io.emit("new comment", "created new comment");
  } catch (error) {
    console.error("Error creating comment: ", error);
    res.status(500).json({ error });
  }
});

// コメントを編集
router.patch("/editComment/:id/:index", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const index: number = Number(req.params.index);

    let { editedComment }: {
      editedComment: string;
    } = req.body;

    let comments: Comment[] = [];

    const q = query(collection(db, "threads"), where(documentId(), "==", id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      comments = doc.data().comments;
    });

    let newComments: Comment[] = comments;
    newComments[index].text = editedComment;
    newComments[index].updatedAt = new Date();

    await updateDoc(doc(db, "threads", id), {
      comments: newComments,
    });

    io.emit("edit comment", "edited comment");
  } catch (error) {
    console.error("Error creating comment: ", error);
    res.status(500).json({ error });
  }
});

// スレッドを削除
router.delete("/deleteThread/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await deleteDoc(doc(db, "threads", id));

    io.emit("delete thread", "deleted thread");
  } catch (error) {
    console.error("Error deleting thread: ", error);
    res.status(500).json({ error });
  }
});

// コメントを削除（isDeletedをtrueにするのみ）
router.patch("/deleteComment/:id/:index", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const index: number = Number(req.params.index);

    let comments: Comment[] = [];

    const q = query(collection(db, "threads"), where(documentId(), "==", id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      comments = doc.data().comments;
    });

    let newComments: Comment[] = comments;
    newComments[index].isDeleted = true;

    await updateDoc(doc(db, "threads", id), {
      comments: newComments,
    });

    io.emit("delete comment", "deleted comment");
  } catch (error) {
    console.error("Error creating comment: ", error);
    res.status(500).json({ error });
  }
});

export default router;
