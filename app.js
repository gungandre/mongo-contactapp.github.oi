const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

require("./utils/db");
const contact = require("./model/contact");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

// gunakan express-ejs-layouts
app.use(expressLayouts);

//build i middleware untuk membuat folder public
app.use(express.static("public"));

//memakai method everide agar bisa menggunakan method put dan delete
app.use(methodOverride("_method"));

//konfigurasi flash
app.use(flash());
app.use(cookieParser("secret"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

//build in middleware yang dapat mengambil data post dari form
app.use(express.urlencoded({ extended: true }));

//halaman home
app.get("/", (req, res) => {
  const mahasiswa = [
    { nama: "gung", email: "gungd86@gmail.com" },
    { nama: "andre", email: "gungs2gmail.com" },
  ];
  res.render("index", {
    nama: "Gung Andre",
    title: "Belajar ejs",
    mhs: mahasiswa,
    layout: "layout.ejs",
  });
});

//halaman contact
app.get("/contact", async (req, res) => {
  const contacts = await contact.find();

  console.log(contacts);
  res.render("contact", {
    title: "Halaman Contact",
    contacts: contacts,
    msg: req.flash("msg"),
  });
});

//halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", { title: "Form Tambah Data Contact" });
});

//proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await contact.findOne({ nama: value });
      console.log("test", duplikat);
      if (duplikat) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("email", "email tidak valid").isEmail(),
    check("nohp", "no hp  tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    //validasi email
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        errors: errors.array(),
      });
    } else {
      contact.insertMany(req.body, (error, result) => {
        if (result) {
          //kirimkan flash message. msg akan menjadi variable sementara di halaman contact
          req.flash("msg", "Data berhasil ditambahkan");
          //redirect untuk memanggil ulang route dengan method GET/response dengan status code 302
          res.redirect("/contact");
        }
      });
    }
  }
);

//halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  const kontak = await contact.findOne({ nama: req.params.nama });
  console.log(kontak);
  res.render("detail", { title: "Halaman Detail Contact", contact: kontak });
});

// //hapus data contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const kontak = await contact.findOne({ nama: req.params.nama });
//   if (!kontak) {
//     res.status(404);
//     res.send("<h1>404 Status</h1>");
//   } else {
//     contact.deleteOne({ _id: kontak._id }).then((result) => {
//       console.log("hau", result);
//       //kirimkan flash message. msg akan menjadi variable sementara di halaman contact
//       req.flash("msg", "Data contact berhasil dihapus");
//       //redirect untuk memanggil ulang route dengan method GET/response dengan status code 302
//       res.redirect("/contact");
//     });
//   }
// });

//cara menggunakan request method delete menggunakan module method-overide dengan hapus data contact
app.delete("/contact", async (req, res) => {
  contact.deleteOne({ nama: req.body.nama }).then(() => {
    req.flash("msg", "Data contact berhasil dihapus");
    res.redirect("/contact");
  });
});

//form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const kontak = await contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    contact: kontak,
  });
});

//proses ubah data contact
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await contact.findOne({ nama: value });
      console.log("duplikat", duplikat);
      console.log(value);
      if (req.body.namaLama !== value && duplikat) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("email", "email tidak valid").isEmail(),
    check("nohp", "no hp  tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    //validasi email
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      console.log("hai", req.body._id);
      contact
        .updateOne(
          { _id: req.body._id },
          {
            $set: {
              nama: req.body.nama,
              email: req.body.email,
              nohp: req.body.nohp,
            },
          }
        )
        .then((result) => {
          console.log("hau", result);
          //kirimkan flash message. msg akan menjadi variable sementara di halaman contact
          req.flash("msg", "Data Contact berhasil diubah");
          //redirect untuk memanggil ulang route dengan method GET/response dengan status code 302
          res.redirect("/contact");
        });
    }
  }
);

//halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    //pemanggilan relatif terhadap folder views, karena menggunakan ejs
    layout: "layout",
    title: "Halaman About",
  });
});

app.listen(port, () => {
  console.log(`Mongo contact app listening on port ${port}!`);
});
