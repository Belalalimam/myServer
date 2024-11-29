const mongoose = require("mongoose");

// Verification Token Schema
const VerificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Verificaton Token Model
const VerificationToken = mongoose.model("VerificationToken", VerificationTokenSchema);

module.exports = VerificationToken;