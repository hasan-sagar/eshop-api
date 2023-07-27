const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  let body = {
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  };
  await User.create(body)
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
