// Seed script — ek baar chalaao, akshatmarwadi5@gmail.com admin ban jayega
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("./models/User");

const ADMIN_EMAIL = "akshatmarwadi5@gmail.com";

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(async () => {
    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.log(`❌ User '${ADMIN_EMAIL}' nahi mila. Pehle register karo phir seed chalaao.`);
      process.exit(1);
    }
    user.role = "admin";
    await user.save();
    console.log(`✅ SUCCESS! '${ADMIN_EMAIL}' ab ADMIN hai!`);
    console.log(`   Ab login karo aur /admin page pe jao.`);
    process.exit(0);
  })
  .catch(err => {
    console.log("❌ MongoDB connect nahi hua:", err.message);
    process.exit(1);
  });
