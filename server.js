const express = require('express');
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.use("/user", require("./routes/userRoutes"));

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

