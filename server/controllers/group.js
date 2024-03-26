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
//             attributes: ['id', 'groupName', 'createdAt', 'adminId'],
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

//         // Fetch admin names for all groups concurrently
//         await Promise.all(formattedGroups.map(async (group) => {
//             console.log('Admin ID:', group.adminId);
//             try {
//                 const admin = await User.findByPk(group.adminId, { attributes: ['name'] });
//                 console.log('Admin:', admin ? admin.name : 'Unknown');
//                 group.adminName = admin ? admin.name : 'Unknown';
//             } catch (error) {
//                 console.error('Error fetching admin:', error);
//                 group.adminName = 'Unknown';
//             }
//         }));

//         // Send the formatted groups in the response
//         res.json(formattedGroups);
//     } catch (error) {
//         console.error('Error fetching groups:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.getGroups = async (req, res, next) => {
    const userId = req.user.id;

    try {
        // Retrieve groups the user belongs to using eager loading
        const groups = await Group.findAll({
            attributes: ['id', 'groupName', 'createdAt', 'adminId'],
            include: {
                model: User,
                attributes: ['name'],
                as: 'users',
                where: { id: userId }, // Filter users to match the requesting user
            },
            // Include GroupUser to efficiently associate groups with users
            through: {
                model: 'GroupUser', // Use the inferred name for the intermediate table
            },
        });

        // If no groups found (user is not a member of any)
        if (!groups || groups.length === 0) {
            return res.status(404).json({ error: 'No groups found' });
        }

        // Separate loop for fetching admin names asynchronously (efficient)
        const adminNames = await Promise.all(groups.map(group => getAdminName(group.adminId)));

        // Combine formatted groups with admin names
        const finalGroups = await Promise.all(groups.map(async (group, index) => {
            // Fetch names of all users in the group
            const groupUserNames = await getUserNamesByGroupId(group.id);

            return {
                id: group.id,
                groupName: group.groupName,
                adminId: group.adminId,
                userName: groupUserNames,
                adminName: adminNames[index],
                createdAt: group.createdAt,
            };
        }));

        // Send the formatted response
        res.json(finalGroups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Helper function to fetch names of all users in a group
async function getUserNamesByGroupId(groupId) {
    try {
        // Find the Group entry with the given groupId
        const group = await Group.findByPk(groupId);

        // If group is not found, return an empty array
        if (!group) {
            return [];
        }

        // Use the association to fetch all users in the group
        const users = await group.getUsers({ attributes: ['name','id'] });

        // Extract user names from the result
        return users.map(user => ({ id: user.id, name: user.name })); 
    } catch (error) {
        console.error('Error fetching user names:', error);
        return []; // Return an empty array in case of error
    }
}

exports.removeUserFromGroup = async (req, res) => {
    // const { groupId, userId } = req.body;
    const groupId = req.body.groupId // Assuming you're passing groupId and userId in the request body
    const userId = req.body.id // Assuming you're passing groupId and userId in the request body

    try {
        // Find the group
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Remove the user from the group using the association method
        await group.removeUser(userId);

        // Success message
        return res.status(200).json({ message: `User with ID ${userId} removed from group with ID ${groupId}` });
    } catch (error) {
        console.error('Error removing user from group:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Helper function to fetch admin name (optional)
async function getAdminName(adminId) {
    try {
        const admin = await User.findByPk(adminId, { attributes: ['name'] });
        return admin ? admin.name : 'Unknown';
    } catch (error) {
        console.error('Error fetching admin name:', error);
        return 'Unknown'; // Set a default value for error handling
    }
}


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