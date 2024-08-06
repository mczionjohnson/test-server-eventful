import mongoose, { Document, ObjectId } from 'mongoose'


import bcrypt from "bcrypt";

export interface IUser {
  username: string,
  email: string,
  eventTickets: [string],
  eventAttended: [string],
  eventCreated: [string],
}

interface IUserDoc extends Document, IUser { }

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  eventTickets: [],
  eventAttended: [],
  eventCreated: []
});

// The code in the UserScheme.pre() function is called a pre-hook.
// Before the user information is saved in the database, this function will be called,
// you will get the plain text password, hash it, and store it.
userSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);

  this.password = hash;
  next();
});

// You will also need to make sure that the user trying to log in has the correct credentials. Add the following new method:
userSchema.methods.isValidPassword = async function (password: string) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

// module.exports= mongoose.model("Users", UserSchema);

export const User = mongoose.model<IUserDoc>("User", userSchema);

// export default User;
