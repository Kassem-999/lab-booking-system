const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "S'il vous plaît ajoutez un nom"],
    },
    email: {
      type: String,
      required: [true, "S'il vous plaît ajoutez un email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "S'il vous plaît ajoutez un email valide",
      ],
    },
    password: {
      type: String,
      required: [true, "S'il vous plaît ajoutez un mot de passe"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);