// Role Model
const Role = require('../models/roleModel');
const { Snowflake } = require('@theinternetfolks/snowflake');

// Create a new role
const createRole = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate the name (minimum length of 2 characters)
        if (!name || name.length < 2) {
            return res.status(400).json({ status: false, message: 'Role name must be at least 2 characters long.' });
        }

        // Check if a role with the same name already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ status: false, message: 'Role with the same name already exists.' });
        }

        // Create the new role
        const id = Snowflake.generate();

        const newRole = new Role({ id, name });
        await newRole.save();

        return res.status(200).json({
            status: true,
            content: {
                data: {

                    name: newRole.name,
                    created_at: newRole.created_at,
                    updated_at: newRole.updated_at,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error creating role.', error: error.message });
    }
};


// Get all roles with pagination
const getAllRoles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter, default to 1
        const perPage = 10; // Number of roles per page

        // Calculate the skip value to paginate through roles
        const skip = (page - 1) * perPage;

        // Query roles and count total roles
        const roles = await Role.find()
            .skip(skip)
            .limit(perPage)
            .exec();

        const totalRoles = await Role.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRoles / perPage);

        // Create the meta object with pagination details
        const meta = {
            total: totalRoles,
            pages: totalPages,
            page,
        };

        return res.status(200).json({
            status: true,
            content: {
                meta,
                data: roles,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error fetching roles.', error: error.message });
    }
};

module.exports = { createRole, getAllRoles };
