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
      lowercase: true,
    },

    searchKeywords: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

bookSchema.index(
  { searchKeywords: "text" },
  {
    default_language: "none",
    language_override: "others", // Prevent Mongo from using `language` field
  },
);
bookSchema.index(
  { isbn: 1 },
  {
    unique: true,
    partialFilterExpression: { isbn: { $exists: true, $gt: "" } },
  },
);
// bookSchema.index(
//   { author: "text", publisher: "text", genre: "text" },
//   {
//     weights: { author: 5, publisher: 3, genre: 1 },
//     default_language: "none",
//     language_override: "others", // Prevent Mongo from using `language` field
//   },
// );

bookSchema.set("toJSON", { versionKey: false });

const Book = mongoose.model("Book", bookSchema);

export default Book;
