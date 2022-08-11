const { builtinModules } = require("module");
const mongoose = require("mongoose");

//mmebuat struktur database
const contact = mongoose.model("contact", {
  nama: {
    type: String,
    required: true,
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = contact;
