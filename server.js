const express = require('express');          // used to create server/backend
const connectDB = require('./config/db')

const app = express();          // creating a express app

// estabilshing database connection
connectDB();

// init Middleware  // body parser substitue
app.use(express.json());

app.get('/', (req,res) => {
	res.send("<h1>API running</h1>");
})

// define routes
app.use('/api/users' , require('./routes/api/users'));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));



const port = process.env.PORT || 5000;   // end point when we are in developing mode

app.listen(port, () => {                                    // establishing the port
	console.log(`Server is alive and running on http://localhost:${port}`);
})