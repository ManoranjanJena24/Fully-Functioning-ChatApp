const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')



function generateHash(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));//genSaltSync randomizes the password 8 times 
}

function generateAccessToken(id, phone,isPremium,name) { 
    return jwt.sign(
        {
            userId: id,
            phone: phone,
            isPremium: isPremium,
            name:name
        }, process.env.TOKEN_SECRET)
}

exports.postCreateUser = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    generateHash(req.body.password)
        .then(hashedPassword => {
            return User.create({
                name: name,
                phone: phone,
                email: email,
                password: hashedPassword,
               
            });
        })
        .then(result => {
            console.log("Created User");
            res.json({message:"Signed Up Successfully"});
        })
        .catch(err => {
            console.error(err);

            if (err.name === 'SequelizeUniqueConstraintError') {
                // Handle duplicate email error
                // res.status(403).send('Account with this Email or Phone already exists');
                if (err.fields.includes('email') || err.fields.includes('phone')) {
                    // Handle duplicate email or phone error
                    res.status(403).send('Account with this Email or Phone already exists');
                } else {
                    // Handle other unique constraint errors
                    res.status(403).send('Unique constraint violation');
                }
            } else {
                res.status(500).send('Internal Server Error');
            }
        });
};


function validPassword(password, dbPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, dbPassword, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}



exports.postLoginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        where: {
            email: email,
        }
    })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            validPassword(password, user.password)
                .then((isValid) => {
                    if (isValid) {
                        // req.session=user
                        console.log(user.id)
                        // console.log(req.session.name)
                        isPremium = user.ispremiumuser
                        phone = user.phone
                        return res.status(200).json({ success: true, token: generateAccessToken(user.id, user.phone, user.isPremium, user.name), isPremium: isPremium, phone: phone });
                    } else {
                        res.status(401).json({ success: false, message: 'Invalid password. User not authorized' });//changed
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        });
};

