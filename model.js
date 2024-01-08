const mongoose = require('mongoose');

const SaveSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
        },
        summary:{
            type: String,
            required: true,
        },
    }
)

const SaveSummary = mongoose.models.SaveSummary || mongoose.model('SaveSummary', SaveSchema);

module.exports = SaveSummary;