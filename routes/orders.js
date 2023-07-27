const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

router.get(`/`, async (req, res) => {
  await Order.find()
    .populate("user", "name")
    .sort("dateOrdered")
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem",
        error: error.toString(),
      });
    });
});

router.post("/create", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolve = await orderItemsIds;
  const totalPrices = await Promise.all(
    orderItemsIdsResolve.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  console.log(orderItemsIdsResolve);
  let order = new Order({
    orderItems: orderItemsIdsResolve,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  await order
    .save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Cant create order",
        error: error.toString(),
      });
    });
});

router.get("/:id", async (req, res) => {
  await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem",
        error: error.toString(),
      });
    });
});

router.put("/update/:id", async (req, res) => {
  await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  )
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem",
        error: error.toString(),
      });
    });
});

router.delete("/delete/:id", async (req, res) => {
  await Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res.status(200).send({
          message: "Order Deleted",
        });
      } else {
        res.status(400).json({ message: "Order Not Found" });
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem",
        error: error.toString(),
      });
    });
});

router.get("/get/totalSales", async (req, res) => {
  await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ])
    .then((data) => {
      res.status(200).json(data.pop().totalsales);
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server problem",
        error: error.toString(),
      });
    });
});

router.get("/get/count", async (req, res) => {
  await Order.countDocuments()
    .then((data) => {
      res.status(200).json({
        orderCount: data,
      });
    })
    .catch((error) => {
      res.status(400).send({
        message: "Server Problem",
        error: error.toString(),
      });
    });
});

router.get("/get/userorders/:userid", async (req, res) => {
  await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 })
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

module.exports = router;
