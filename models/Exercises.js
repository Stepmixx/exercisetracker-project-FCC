const mongoose = require("mongoose");
const Users = require("./Users");

const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: [20, "description too long"],
  },
  duration: {
    type: Number,
    required: true,
    min: [1, "duration too short"],
  },
  date: {
    type: Date,
    required: true,
  },
  username: String,
  userId: {
    type: String,
    ref: Users,
    index: true,
  },
});

module.exports = mongoose.model("Exercices", exerciseSchema);
