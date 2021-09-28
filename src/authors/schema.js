import mongoose from "mongoose";
import bcrypt from "bcrypt"

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    //password
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=Unnamed+User",
    },
  },
  { timestamps: true }
);

authorSchema.pre("save", async function (done) {
  this.avatar = `https://ui-avatars.com/api/?name=${this.name}+${this.surname}`;
  // hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  done();
});

// static: find using credentials

authorSchema.statics.findByCredentials = async function (email, password) {

  const user = await AuthorModel.findOne({ email })

  try {
    if (await bcrypt.compare(password, user.password))
      return user
  } catch { }

  return null
}

const AuthorModel = mongoose.model("Author", authorSchema);

export default AuthorModel
