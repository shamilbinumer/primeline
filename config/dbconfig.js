const mongoose = require("mongoose");

module.exports = {
  dbconfig: async () => {
    try {
      await mongoose.connect('mongodb+srv://shamilmohd418:VPnGrCfAORIefCUS@cluster0.rp3td.mongodb.net/primeline', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Database Connected");
    } catch (error) {
      console.error("Database Connection Failed:", error.message);
    }
  },
};
