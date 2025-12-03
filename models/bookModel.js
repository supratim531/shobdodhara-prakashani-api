import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      index: true,
    },

    publisher: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    genre: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    pages: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index(
  { author: "text", publisher: "text", genre: "text" },
  { weights: { author: 5, publisher: 3, genre: 1 } }
);

bookSchema.set("toJSON", { versionKey: false });

const Book = mongoose.model("Book", bookSchema);

export default Book;
