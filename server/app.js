const express = require('express');
// const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config();
const bodyParser = require('body-parser');
const sequelize = require('./utils/database')
var Sib = require('sib-api-v3-sdk');
// const sib = new Sib()
const fs = require('fs')
const path = require('path');


const User = require('./models/user')

const Message = require('./models/message')

const Group = require('./models/group')
// const Order = require('./models/order')
// const ForgotPassword = require('./models/forgotPassword')
// const Salary = require('./models/salary')


const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
const cors = require('cors')


app.use(morgan('combined', { stream: accessLogStream }))

const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')
const groupRoutes = require('./routes/group')
const mainPageRouter = require('./routes/mainpage')
// const passwordRoutes = require('./routes/password')
// const salaryRoutes = require('./routes/salary')

app.use(bodyParser.json({ extended: false }));
app.use(cors())
app.use(express.static('client'))
app.use(express.static('views'))

// app.set('view engine', 'ejs'); // Set EJS as the view engine
// app.set('views', path.join(__dirname, 'views'));


app.use(mainPageRouter)
app.use('/user', userRoutes);
app.use('/message', messageRoutes)
app.use('/group', groupRoutes)
// app.use('/password', passwordRoutes)
// app.use('/salary', salaryRoutes)

// app.use((req, res, next) => {
//     console.log('url>>>>>>>', req.url)
//     res.sendFile(path.join(__dirname, `client/${req.url}`))

// })




Message.belongsTo(User)
User.hasMany(Message)
Group.belongsToMany(User, { through: 'GroupUser' });
User.belongsToMany(Group, { through: 'GroupUser' });
Message.belongsTo(Group)
Group.hasMany(Message)

// ForgotPassword.belongsTo(User)
// User.hasMany(ForgotPassword)
// Salary.belongsTo(User)
// User.hasMany(Salary)

sequelize.sync({
    // force: true  //these should not be done in production becoz we donot want to overwrite the table everytime we run
    // alter:true
})
app.listen(3000)