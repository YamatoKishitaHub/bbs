type Thread = {
  id: string;
  title: string;
  comments: Comment[];
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

type Comment = {
  text: string;
  user: User;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  name: string;
};

export { Thread, Comment, User };
