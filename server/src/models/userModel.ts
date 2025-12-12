import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

// Interface for the User
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  provider: AuthProvider;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  userType?: mongoose.Types.ObjectId;
  IsActive?: boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: function () { return this.provider === AuthProvider.LOCAL; } },
    avatar: { type: String, default: null },
    provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER, required: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    // Legacy fields for backward compatibility
    userType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType', default: null },

    IsActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
