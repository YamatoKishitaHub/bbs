type Thread = {
  id: string;
  title: string;
  comments: Comment[];
  user: User;
  createdAt: any;
  updatedAt: any;
};

type Comment = {
  text: string;
  user: User;
  isDeleted: boolean;
  createdAt: any;
  updatedAt: any;
};

type User = {
  id: string;
  name: string;
};

export { Thread, Comment, User };
