// here we are conencting our application to the database with help of mongoose
const mongoose = require('mongoose');   
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async() => {
	try {
		await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
		console.log('MongoDB Database connected successfully');
	} catch(err) {
		console.error(err.message)
		process.exit(1)                    // exit process if failure
	}
}

module.exports = connectDB;