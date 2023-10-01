const CommunityModel = require('../models/communityModel');
const MemberModel = require('../models/memberModel');
const UserModel = require('../models/userModel');
const { Snowflake } = require('@theinternetfolks/snowflake');

// @desc Create a Community via user
// @route /v1/community/
// @access private

const createCommunity = async (req, res) => {
    try {
        const { name } = req.body;
        const owner = req.user.id; // Assuming we have authenticated the user and attached their ID to the request

        // Validate input fields (e.g., minimum name length)
        if (!name || name.length < 2) {
            return res.status(400).json({ status: false, message: 'Invalid input data.' });
        }

        // Autogenerate the slug from the name (e.g., replace spaces with hyphens)
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const id = Snowflake.generate();

        // Create a new community
        const newCommunity = new CommunityModel({
            id,
            name,
            slug,
            owner,
        });

        // Save the community to the database
        await newCommunity.save();

        // Create a new member for the owner with the role "Community Admin"
        const newMember = new MemberModel({
            community: newCommunity.id,
            user: owner,
            role: 'Community Admin',
        });

        // Save the member to the database
        await newMember.save();

        return res.status(200).json({
            status: true,
            content: {
                data: newCommunity,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error creating community.', error: error.message });
    }
};




// @desc Get All Communities 
// @route /v1/community/
// @access public

// Get all communities with pagination and expanded owner details
const getAllCommunities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;

        // Calculate skip value for pagination
        const skip = (page - 1) * perPage;

        // Query communities with pagination
        const communities = await CommunityModel.find()
            .skip(skip)
            .limit(perPage)
            .sort({ created_at: -1 }) // Sort by creation date in descending order

        // Calculate total number of documents
        const total = await CommunityModel.countDocuments();

        // Expand owner details (id and name) without revealing sensitive information

        const expandedCommunities = await Promise.all(communities.map(async (community) => {
            const owner = await UserModel.findOne({ id: community.owner }, 'id username');

            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: owner || {}, // Ensure owner is an object even if not found
                created_at: community.created_at,
                updated_at: community.updated_at,
            };
        }));

        const totalPages = Math.ceil(total / perPage);

        return res.status(200).json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: totalPages,
                    page,
                },
                data: expandedCommunities,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error fetching communities.', error: error.message });
    }
};

// @desc Get All Members
// @route /v1/community/:id/members
// @access public








module.exports = { createCommunity, getAllCommunities };
