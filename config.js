const mongoose = require("mongoose");

const DbConnection = () => {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (error) {
    console.log("Error connecting to database" + error.message);
  }
};

module.exports = DbConnection;