"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
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
    const hash = await bcrypt_1.default.hash(this.password, 10);
    this.password = hash;
    next();
});
// You will also need to make sure that the user trying to log in has the correct credentials. Add the following new method:
userSchema.methods.isValidPassword = async function (password) {
    const user = this;
    const compare = await bcrypt_1.default.compare(password, user.password);
    return compare;
};
// module.exports= mongoose.model("Users", UserSchema);
exports.User = mongoose_1.default.model("User", userSchema);
// export default User;
