//package mongodb untuk memudahkan koneksi ke database
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/db_contact", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// //menambah 1 data
// const contact1 = new contact({
//   nama: "Gungandrew",
//   nohp: "08123456qeqvqe",
//   email: "gungvqqv6@gmail.com",
// });

// //simpan ke collection/database
// contact1.save().then((success) => {
//   console.log(success);
// });
