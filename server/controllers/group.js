const Group = require('../models/group');
const User = require('../models/user');
const sequelize = require('../utils/database')
const { Op } = require('sequelize');

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
//     try {
//         // Retrieve all groups
//         const groups = await Group.findAll({
//             attributes: ['id', 'groupName', 'createdAt','adminId'],
//             include: {
//                 model: User,
//                 attributes: ['name'],
//                 as: 'users'
//             }
//         });

//         // If there are no groups found
//         if (!groups || groups.length === 0) {
//             return res.status(404).json({ error: 'No groups found' });
//         }

//         // Map the retrieved groups to the desired format
//         const formattedGroups = groups.map(group => ({
//             id: group.id,
//             groupName: group.groupName,
//             adminId: group.adminId,
//             userName: group.users.map(user => user.name),
//             createdAt: group.createdAt
//         }));

//         // Send the formatted groups in the response
//         res.json(formattedGroups);
//     } catch (error) {
//         console.error('Error fetching groups:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.getGroups = async (req, res, next) => {
    try {
        // Retrieve all groups
        const groups = await Group.findAll({
            attributes: ['id', 'groupName', 'createdAt', 'adminId'],
            include: {
                model: User,
                attributes: ['name'],
                as: 'users'
            }
        });

        // If there are no groups found
        if (!groups || groups.length === 0) {
            return res.status(404).json({ error: 'No groups found' });
        }

        // Map the retrieved groups to the desired format
        const formattedGroups = groups.map(group => ({
            id: group.id,
            groupName: group.groupName,
            adminId: group.adminId,
            userName: group.users.map(user => user.name),
            createdAt: group.createdAt
        }));

        // Fetch admin names for all groups concurrently
        await Promise.all(formattedGroups.map(async (group) => {
            console.log('Admin ID:', group.adminId);
            try {
                const admin = await User.findByPk(group.adminId, { attributes: ['name'] });
                console.log('Admin:', admin ? admin.name : 'Unknown');
                group.adminName = admin ? admin.name : 'Unknown';
            } catch (error) {
                console.error('Error fetching admin:', error);
                group.adminName = 'Unknown';
            }
        }));

        // Send the formatted groups in the response
        res.json(formattedGroups);
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


exports.postAddUserToGroup = async (req, res, next) => {
    const { groupId, userId } = req.body;

    try {
        // Check if the user is already a member of the group
        const existingMembership = await sequelize.models.GroupUser.findOne({
            where: {
                groupId: groupId,
                userId: userId
            }
        });

        if (existingMembership) {
            return res.status(400).json({ error: 'User is already a member of the group' });
        }

        // Add the user to the group
        await sequelize.models.GroupUser.create({
            groupId: groupId,
            userId: userId
        });

        res.status(200).json({ message: 'User added to group successfully' });
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};