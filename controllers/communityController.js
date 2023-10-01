
const CommunityModel = require('../models/communityModel');
const MemberModel = require('../models/memberModel');
const UserModel = require('../models/userModel');
const { Snowflake } = require('@theinternetfolks/snowflake');
const jwt = require('jsonwebtoken');
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

const getAllMembers = async (req, res) => {
    try {
        const communityId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;

        // Query to get members of the community with pagination
        const members = await MemberModel.find({ community: communityId })

        // Count total members in the community
        const totalMembers = await MemberModel.countDocuments({ community: communityId });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalMembers / perPage);

        // Prepare the response
        const response = ({
            meta: {
                total: totalMembers,
                pages: totalPages,
                page: page,
            },
            data: members.map((member) => ({
                id: member.id,
                community: member.community,
                user: {
                    id: member.user,
                },
                role: {
                    id: member.role,
                },
                created_at: member.created_at,
            })),
        });

        return res.status(200).json({ status: true, content: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


// @desc Get My Communities
// @route /v1/community/me/owner
// @access private


const getMyOwnedCommunity = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Verify and decode the JWT token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.user.id;
        // Pagination options
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Query to find communities owned by the user
        const communities = await CommunityModel.find({ owner: userId })
            .skip(skip)
            .limit(limit);

        // Count the total number of owned communities
        const totalOwnedCommunities = await CommunityModel.countDocuments({ owner: userId });

        const totalPages = Math.ceil(totalOwnedCommunities / limit);

        // Prepare the response data
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalOwnedCommunities,
                    pages: totalPages,
                    page: page,
                },
                data: communities.map((community) => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                })),
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


// @desc Get Communities I Joined.
// @route GET /v1/community/me/member
// @access private

const getMyJoinedCommunities = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Verify and decode the JWT token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.user.id;

        // Pagination parameters (you can customize these as needed)
        const perPage = 10; // Number of items per page
        const page = parseInt(req.query.page) || 1; // Current page number

        // Query to find communities where the user is a member
        const query = {
            'members.user': userId,
        };

        // Count the total number of matching documents
        const totalCommunities = await CommunityModel.countDocuments(query);

        // Fetch communities with pagination
        const communities = await CommunityModel.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate({
                path: 'owner',
                select: 'id username', // Only select 'id' and 'name' fields for the owner
            })
            .lean(); // Convert Mongoose document to plain JavaScript object

        const totalPages = Math.ceil(totalCommunities / perPage);

        // Prepare the response data
        const responseData = {
            meta: {
                total: totalCommunities,
                pages: totalPages,
                page: page,
            },
            data: communities,
        };

        res.status(200).json({ status: true, content: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};





module.exports = { createCommunity, getAllCommunities, getAllMembers, getMyOwnedCommunity, getMyJoinedCommunities };
