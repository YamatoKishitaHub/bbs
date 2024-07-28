"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../lib/firebase");
const server_1 = require("../server");
const router = express_1.default.Router();
// スレッド一覧を取得
router.get("/allThreads", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const threads = [];
        const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'threads'));
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
    }
    catch (error) {
        console.error("Error fetching threads: ", error);
        res.status(500).json({ error });
    }
}));
// スレッドを取得
router.get("/thread/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        let thread = {
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
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, "threads"), (0, firestore_1.where)((0, firestore_1.documentId)(), "==", id));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        querySnapshot.forEach((doc) => {
            thread.title = doc.data().title;
            thread.comments = doc.data().comments;
            thread.user = doc.data().user;
            thread.createdAt = doc.data().createdAt;
            thread.updatedAt = doc.data().updatedAt;
        });
        res.json(thread);
    }
    catch (error) {
        console.error("Error fetching thread: ", error);
        res.status(500).json({ error });
    }
}));
// 新しいスレッドを追加
router.post("/newThread", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, user } = req.body;
        yield (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, "threads"), {
            title,
            comments: [],
            user,
            createdAt: new Date(),
        });
        server_1.io.emit("new thread", "created new thread");
    }
    catch (error) {
        console.error("Error creating thread: ", error);
        res.status(500).json({ error });
    }
}));
// コメントを追加
router.post("/newComment/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        let { comment } = req.body;
        comment.createdAt = new Date();
        comment.updatedAt = new Date();
        let comments = [];
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, "threads"), (0, firestore_1.where)((0, firestore_1.documentId)(), "==", id));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        querySnapshot.forEach((doc) => {
            comments = doc.data().comments;
        });
        yield (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_1.db, "threads", id), {
            comments: [...comments, comment],
            updatedAt: new Date(),
        });
        server_1.io.emit("new comment", "created new comment");
    }
    catch (error) {
        console.error("Error creating comment: ", error);
        res.status(500).json({ error });
    }
}));
// コメントを編集
router.patch("/editComment/:id/:index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const index = Number(req.params.index);
        let { editedComment } = req.body;
        let comments = [];
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, "threads"), (0, firestore_1.where)((0, firestore_1.documentId)(), "==", id));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        querySnapshot.forEach((doc) => {
            comments = doc.data().comments;
        });
        let newComments = comments;
        newComments[index].text = editedComment;
        newComments[index].updatedAt = new Date();
        yield (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_1.db, "threads", id), {
            comments: newComments,
        });
        server_1.io.emit("edit comment", "edited comment");
    }
    catch (error) {
        console.error("Error creating comment: ", error);
        res.status(500).json({ error });
    }
}));
// スレッドを削除
router.delete("/deleteThread/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, "threads", id));
        server_1.io.emit("delete thread", "deleted thread");
    }
    catch (error) {
        console.error("Error deleting thread: ", error);
        res.status(500).json({ error });
    }
}));
// コメントを削除（isDeletedをtrueにするのみ）
router.patch("/deleteComment/:id/:index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const index = Number(req.params.index);
        let comments = [];
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, "threads"), (0, firestore_1.where)((0, firestore_1.documentId)(), "==", id));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        querySnapshot.forEach((doc) => {
            comments = doc.data().comments;
        });
        let newComments = comments;
        newComments[index].isDeleted = true;
        yield (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_1.db, "threads", id), {
            comments: newComments,
        });
        server_1.io.emit("delete comment", "deleted comment");
    }
    catch (error) {
        console.error("Error creating comment: ", error);
        res.status(500).json({ error });
    }
}));
exports.default = router;
