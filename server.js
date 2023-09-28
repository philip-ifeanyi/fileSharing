require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const DbConnection = require('./config');
const bcrypt = require('bcrypt');
const File = require('./models/File');

DbConnection();
const app = express();
const PORT = process.env.PORT
const upload = multer({ dest: 'uploads' })


app.use(express.urlencoded({ extended: true }));
app.set('view engine', "ejs")

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/upload', upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  }
  if (req.body.password != null && req.body.password !== "") {
    fileData.password = await bcrypt.hash(req.body.password, 15)
  }

  const file =  await File.create(fileData)

  res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })
})

const handleDownload = async (req, res) => {
  const file = await File.findById(req.params.id)

  if (file.password != null) {
    if(req.body.password == null) {
      res.render("password")
    return
    }

    if(!(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", {error: true})
      return
    }
  }

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    res.download(file.path, file.originalName)
}

app.route("/file/:id").get(handleDownload).post(handleDownload) 

mongoose.connection.once("open", () => {
  console.log("Database connection established");
  app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
  });
});