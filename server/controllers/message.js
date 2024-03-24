const User = require('../models/user')
const sequelize = require('../utils/database')
const Message = require('../models/message')
const { Op } = require('sequelize');

// exports.postAddMessage = (req, res, next) => {
//     const userId = req.user.id
//     const message = req.body.message
//     Message.create({
//         message: message,
//         userId: userId
//     }).then(() => {
//         res.send("Message sent succesfully")

//     }).catch((err) => {
//         res.send(err)
//     })

// };

exports.postAddMessage = (req, res, next) => {
    const groupId = req.query.groupId
    const userId = req.user.id
    const message = req.body.message
    Message.create({
        message: message,
        userId: userId,
        groupId: groupId
    }).then(() => {
        res.send("Message sent succesfully")

    }).catch((err) => {
        res.send(err)
    })

};

exports.getMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastmsgId || -1;
        const messages = await Message.findAll({
            where: {
                id: { [Op.gt]: lastMessageId }
            },
            attributes: [
                'id',
                'message',
                'groupId',
                'createdAt',
                [sequelize.col('user.name'), 'name'], // Include user.name as 'name'
            ],
            include: [{
                model: User,
                attributes: [], // No need to specify attributes for User model
            }],
        });
        console.log(messages, "messssssaagesss")
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


