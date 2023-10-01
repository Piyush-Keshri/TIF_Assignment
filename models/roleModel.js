const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    id: String,
    name: {
        type: String, unique: true
    },
    created_at: {
        type: Date, default: Date.now
    },
    updated_at: Date,
});

const RoleModel = mongoose.model('Role', roleSchema);

module.exports = RoleModel;
