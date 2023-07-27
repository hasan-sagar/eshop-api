const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cors = require('cors')

app.use(express.json());
app.use(cors())
app.use('/public/uploads',express.static(__dirname+'/public/uploads'))

//imported routes
const ProductRoute = require('./routes/products')
const CategoryRoute = require('./routes/categories')
const OrderRoute = require('./routes/orders')
const UserRoute = require('./routes/users');

//Database Connection
let URI = "mongodb+srv://<username>:<password>@api-cluster.zce06no.mongodb.net/ecommerce-api";
let OPTION = { user: 'sagar', pass: 'sagar', autoIndex: true }
mongoose.connect(URI, OPTION).then(() => {
    console.log("DB CONNECT");
}).catch((err) => {
    console.log(err);
})

//app route
app.use('/api/products', ProductRoute,);
app.use('/api/categories', CategoryRoute);
app.use('/api/orders', OrderRoute);
app.use('/api/users', UserRoute);

//Server Running
app.listen(3000, () => {
    console.log("Server on 3000");
})