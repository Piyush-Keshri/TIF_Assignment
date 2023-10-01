const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    id: String,
    name: String,
    slug: {
        type: String,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.String, ref: 'User'
    },
    created_at: {
        type: Date, default: Date.now
    },
    updated_at: Date,
});

const CommunityModel = mongoose.model('Community', communitySchema);

module.exports = CommunityModel;
