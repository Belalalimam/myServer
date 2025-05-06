const { OAuth2Client } = require('google-oauth2-client');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return { payload };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return { error: "Invalid token" };
  }
}

module.exports = { verifyGoogleToken };
