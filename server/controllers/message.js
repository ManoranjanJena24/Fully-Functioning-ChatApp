const User=require('../models/user')
const Message=require('../models/message')

exports.postAddMessage = (req, res, next) => {
    const userId = req.user.id
    const message=req.body.message
    Message.create({
        message: message,
        userId:userId
    }).then(() => {
        res.send("Message sent succesfully")
        
    }).catch((err) => {
        res.send(err)
    })
    
};
