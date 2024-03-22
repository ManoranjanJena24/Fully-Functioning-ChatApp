const User = require('../models/user')
const sequelize = require('../utils/database')
const Message = require('../models/message')

exports.postAddMessage = (req, res, next) => {
    const userId = req.user.id
    const message = req.body.message
    Message.create({
        message: message,
        userId: userId
    }).then(() => {
        res.send("Message sent succesfully")

    }).catch((err) => {
        res.send(err)
    })

};


// exports.getMessages = (req,res,next) => {
//     Message.findAll({
//         include: [{
//             model: User,
//             attributes:['name']
//         }]
//     }).then((messages) => {
//         const result = messages.map((message) => {
//             message: message.message,
//                 name: message.User.name,

//         })
//     })
// }

// exports.getMessages = (req, res, next) => {
//     Message.findAll({
//         include: [{
//             model: User,
//             attributes: ['name']
//         }]
//     }).then((messages) => {
//         console.log(messages, "meeeeeeeessssssssaaaaagesss")
//         const result = messages.map((message) => ({
//             message: message.message,
//             name: name
//         }));
//         res.json(result); // Assuming you want to send the result as JSON response
//     }).catch((error) => {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     });
// };


exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.findAll({
            attributes: [
                'id',
                'message',
                [sequelize.col('user.name'), 'name'], // Include user.name as 'name'
            ],
            include: [{
                model: User,
                attributes: [], // No need to specify attributes for User model
            }],
        });
            console.log(messages,"messssssaagesss")
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};