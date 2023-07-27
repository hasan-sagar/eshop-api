const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  await Category.find()
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

router.post("/create", async (req, res) => {
  let categoryData = req.body;
  await Category.create(categoryData)
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

router.delete("/delete/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id)
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

router.get("/:id", async (req, res) => {
  await Category.findById(req.params.id)
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

router.put("/update/:id", async (req, res) => {
  const body = {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  };
  const id = req.params.id;
  await Category.findByIdAndUpdate(id, body, { new: true })
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Fill Form",
        error: error.toString(),
      });
    });
});

module.exports = router;
