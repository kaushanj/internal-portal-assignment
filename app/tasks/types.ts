export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type DrawerMode = "create" | "edit";
