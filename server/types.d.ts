import { UserModel } from './models/userModels';

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
