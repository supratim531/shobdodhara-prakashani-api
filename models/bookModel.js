import mongoose from "mongoose";

const toCapitalizeCase = (value) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

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

    coEditor: {
      type: String,
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
      trim: true,
      unique: true,
      index: true,
    },

    genre: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    pages: {
      type: Number,
      required: true,
      min: 1,
    },

    binding: {
      type: String,
      required: true,
      trim: true,
      set: toCapitalizeCase,
    },
  },
  {
    timestamps: true,
  },
);

bookSchema.index(
  { author: "text", publisher: "text", genre: "text" },
  {
    weights: { author: 5, publisher: 3, genre: 1 },
    default_language: "none",
    language_override: "others", // Prevent Mongo from using `language` field
  },
);

bookSchema.set("toJSON", { versionKey: false });

const Book = mongoose.model("Book", bookSchema);

export default Book;
