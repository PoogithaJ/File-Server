const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const app = express();

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uploaded files metadata
const uploadedFiles = [];

// // Configure multer to store files in memory
// const upload = multer().single("myfile");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
}).single("myfile");


app.get("/", function (req, res) {
    // Render the view and pass the list of uploaded files metadata
    res.render("files", { files: uploadedFiles });
});

app.post("/", function (req, res, next) {
    // Process file upload
    upload(req, res, function (err) {
        if (err) {
            res.send(err);
        } else {
            uploadedFiles.push({
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                data: req.file.buffer
            });
            // File uploaded successfully
            res.redirect("/");
        }
    });
});

app.get("/uploads/:filename", function (req, res) {
    const fileName = req.params.filename;
    const file = uploadedFiles.find(file => file.originalname === fileName);
    
    if (!file) {
        console.log(`File not found: ${fileName}`);
        res.status(404).send("File not found");
        return;
    }

    console.log(`Sending file: ${fileName}`);
    res.setHeader('Content-Type', file.mimetype);
    // res.send(file.data); // Without storing in the local directory
    res.sendFile(path.join(__dirname, 'uploads', fileName));
});

// Delete requests
app.post("/delete/:filename", function(req, res) {
    const fileName = req.params.filename;
    const index = uploadedFiles.findIndex(file => file.originalname === fileName);
    
    if (index !== -1) {
        // Remove file from the array
        uploadedFiles.splice(index, 1);
        console.log(`File deleted: ${fileName}`);
        res.redirect("/");
    } else {
        console.log(`File not found: ${fileName}`);
        res.status(404).send("File not found");
    }
});


// Download requests
app.get("/download/:filename", function(req, res) {
    const fileName = req.params.filename;
    const file = uploadedFiles.find(file => file.originalname === fileName);
    
    if (!file) {
        console.log(`File not found: ${fileName}`);
        res.status(404).send("File not found");
        return;
    }

    console.log(`Downloading file: ${fileName}`);
    res.set({
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream"
    });
    // res.send(file.data); // Without storing in the local directory
    res.sendFile(path.join(__dirname, 'uploads', fileName));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function (error) {
    if (error) throw error;
    console.log("Server created successfully on PORT 5000");
});