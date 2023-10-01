
const CommunityModel = require('../models/communityModel');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { Snowflake } = require('@theinternetfolks/snowflake');
const MemberModel = require('../models/memberModel');
const jwt = require('jsonwebtoken');

// Controller function to add a member to a community
const addMember = async (req, res) => {
    try {
        // Get the community ID, user ID, and role ID from the request body
        const { community, user, role } = req.body;

        // Get the currently signed-in user's ID from the request object
        const currentUserID = req.user.id;

        // Find the community by ID
        const communityDoc = await CommunityModel.findOne({ id: community });


        if (!communityDoc) {
            return res.status(404).json({ status: false, message: 'Community not found' });
        }

        // Check if the currently signed-in user is the owner (Community Admin) of the community
        if (communityDoc.owner.toString() !== currentUserID) {
            return res.status(403).json({ status: false, message: 'Only Community Admin can add users' });
        }

        // Find the user and role by their respective IDs
        const userDoc = await UserModel.findOne({ id: currentUserID });
        const roleDoc = await RoleModel.findOne({ id: role });

        console.log(userDoc, roleDoc);

        if (!userDoc || !roleDoc) {
            return res.status(404).json({ status: false, message: 'User or Role not found' });
        }

        const id = Snowflake.generate();

        // Create a new member object with the provided data
        const newMember = new MemberModel({
            id,
            community: community,
            user: user,
            role: role,
            created_at: new Date(),
        });

        await newMember.save();

        // Return the response with the newly added member data
        return res.status(201).json({
            status: true,
            content: {
                data: newMember,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Error adding a member to the community' });
    }
};

const removeMember = async (req, res) => {
    try {
        const memberId = req.params.id;

        const member = MemberModel.findOne({ id: memberId });

        if (!member) {
            return res.status(404).json({ status: false, message: 'Member not found' });
        }

        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ status: false, message: 'Invalid token' });
            }

            const userId = decoded.user.id;
            const userRole = MemberModel.findOne({});
            if (userRole !== 'Community Admin' && userRole !== 'Community Moderator') {
                return res.status(403).json({ status: false, message: 'Not allowed to remove members' });
            }

            try {
                await member.deleteOne();
                return res.status(200).json({ status: true });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ status: false, message: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
}


module.exports = { addMember, removeMember };