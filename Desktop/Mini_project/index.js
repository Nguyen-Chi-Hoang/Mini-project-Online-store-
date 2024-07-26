const express = require('express');
const path = require('path');
const app = express();

//Routes
app.use('/', require('./routes/users'));
app.use('/', require('./routes/storepage'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server chay tren cong ${PORT}`));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static("public"));
