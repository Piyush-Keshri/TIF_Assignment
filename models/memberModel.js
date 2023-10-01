const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    id: String,
    community: {
        type: mongoose.Schema.Types.String,
        ref: 'Community'
    },
    user: {
        type: mongoose.Schema.Types.String,
        ref: 'User'
    },
    role: {
        type: mongoose.Schema.Types.String,
        ref: 'Role'
    },
    created_at: {
        type: Date, default: Date.now
    },
});

const MemberModel = mongoose.model('Member', memberSchema);

module.exports = MemberModel;
