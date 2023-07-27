const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");

const FILE_TYPE = {
  "image/png": "png",
  "image/jgp": "jpg",
  "image/jpeg": "jpeg",
};

//image uplaod
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  await Product.find(filter)
    .populate("category")
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem or invalid id",
        error: error.toString(),
      });
    });
});

router.post("/create", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No File Found");
  }
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const filename = req.file.filename;
  const body = {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${filename}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  };

  await Product.create(body)
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Fill form",
        error: error.toString(),
      });
    });
});

router.get("/:id", async (req, res) => {
  await Product.findById(req.params.id)
    .populate("category")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server Problem",
        error: error.toString(),
      });
    });
});

router.delete("/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).send({
        message: "Deleted Data",
      });
    })
    .catch((error) => {
      res.status(400).send({
        message: "Invalid id or Server Problem",
        error: error.toString(),
      });
    });
});

router.get("/get/featured/:count", async (req, res) => {
  await Product.find({ isFeatured: true })
    .limit(req.params.count)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: " Server Problem",
        error: error.toString(),
      });
    });
});

module.exports = router;
