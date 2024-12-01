export interface UserModel {
    id: number;
    name: string;
    username: string;
    password: string;
    role: 'Admin' | 'anchorman' | 'user';
  }
  