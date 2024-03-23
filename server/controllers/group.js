const Group = require('../models/group');
const User = require('../models/user');

exports.createGroup = async (req, res, next) => {
    const { groupName } = req.body;
    const userId = req.user.id;

    try {
        const group = await Group.create({ groupName,adminId:userId });
        await group.addUser(userId); // Add the creator to the group
        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// exports.getGroups = async (req, res, next) => {
//     const userId = req.user.id;

//     try {
//         const groups = await Group.findAll({
//             where: { userId },
//             attributes: ['id', 'groupName'],
//         });
//         res.json(groups);
//     } catch (error) {
//         console.error('Error fetching groups:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.getGroups = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId, {
            include: [{
                model: Group,
                attributes: ['id', 'groupName']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const groups = user.groups;
        console.log(user.groups,"groupppppppps")
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.joinGroup = async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        await group.addUser(userId); // Add user to the group
        res.status(200).json({ message: 'Joined group successfully' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};