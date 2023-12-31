const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnection');

dotenv.config();

connectDb();
const app = express();

const PORT = process.env.PORT || 3000;

console.log(PORT);
app.use(express.json());

app.use('/v1/auth', require('./routes/userRoutes'));
app.use('/v1/roles', require('./routes/roleRoutes'));
app.use('/v1/community', require('./routes/communityRoutes'));
app.use('/v1/member', require('./routes/memberRoutes'));

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});

