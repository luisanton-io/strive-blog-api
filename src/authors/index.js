import express from "express";

import fs from "fs";

import uniqid from "uniqid";

import path, { dirname } from "path";

import { fileURLToPath } from "url";

import { parseFile } from "../utils/upload/index.js";

import Authors from "./schema.js";
import Blogs from "../blogs/schema.js";

import { generateCSV } from "../utils/csv/index.js";

import basicMiddleware from "../utils/auth/basic.js"
import { JwtMiddleware } from "../utils/auth/jwt.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const authorsFilePath = path.join(__dirname, "authors.json");

const router = express.Router();

// get all authors
router.get("/", async (req, res, next) => {
  try {
    const authors = await Authors.find({});
    res.send(authors);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// // get all authors export as csv
// router.get("/csv", async (req, res, next) => {
//   try {
//     const fileAsBuffer = fs.readFileSync(authorsFilePath);
//     const fileAsString = fileAsBuffer.toString();
//     const fileAsJSON = JSON.parse(fileAsString);
//     if (fileAsJSON.length > 0) {
//       const [first, ...rest] = fileAsJSON;
//       const fields = Object.keys(first);
//       const csvBuffer = generateCSV(fields, fileAsJSON);
//       res.setHeader("Content-Type", "text/csv");
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="authors.csv"'
//       );
//       res.send(csvBuffer);
//     } else {
//       res.status(404).send({ message: "there is no one here." });
//     }
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });

// router.get("/me/stories", basicMiddleware, async (req, res, next) => {
router.get("/me/stories", JwtMiddleware, async (req, res, next) => {
  try {
    const posts = await Blogs.find({ author: req.user._id.toString() })

    res.status(200).send(posts)

  } catch (error) {
    next(error)
  }
})

// get single authors
router.get("/:id", async (req, res, next) => {
  try {
    const author = await Authors.findById(req.params.id);
    if (!author) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} is not found!` });
    } else res.send(author);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// delete  author
router.delete("/:id", async (req, res, next) => {
  try {
    const author = Authors.findById(req.params.id);
    if (!author) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} is not found!` });
    }
    await Authors.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//  update author
router.put("/:id", async (req, res, next) => {
  try {
    const changedAuthor = await Authors.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.send(changedAuthor);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// router.put(
//   "/:id/avatar",
//   parseFile.single("avatar"),
//   async (req, res, next) => {
//     try {
//       const fileAsBuffer = fs.readFileSync(authorsFilePath);

//       const fileAsString = fileAsBuffer.toString();

//       let fileAsJSONArray = JSON.parse(fileAsString);

//       const authorIndex = fileAsJSONArray.findIndex(
//         (author) => author.id === req.params.id
//       );
//       if (!authorIndex == -1) {
//         res
//           .status(404)
//           .send({ message: `Author with ${req.params.id} is not found!` });
//       }
//       const previousAuthorData = fileAsJSONArray[authorIndex];
//       const changedAuthor = {
//         ...previousAuthorData,
//         avatar: req.file.path,
//         updatedAt: new Date(),
//         id: req.params.id,
//       };
//       fileAsJSONArray[authorIndex] = changedAuthor;
//       fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
//       res.send(changedAuthor);
//     } catch (error) {
//       res.send(500).send({ message: error.message });
//     }
//   }
// );

export default router;
