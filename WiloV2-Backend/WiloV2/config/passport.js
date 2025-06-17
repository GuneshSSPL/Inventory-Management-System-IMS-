import express from 'express'; // Keep if express.Router() was used, but it will be removed.
import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'; // Import LinkedInStrategy
import { findOrCreateUser, findUserById } from '../services/userService.js';
// import dotenv from 'dotenv'; // This should be removed, app.js handles it

// dotenv.config({ path: process.cwd() + '/WiloV2/.env' }); // This should be removed

const configurePassport = () => {
  // passport.serializeUser and deserializeUser are more for session-based auth.
  // If you're only using JWTs for Auth0 flow, they might not be strictly necessary for /auth/auth0 routes
  // if session: false is used. However, they don't hurt to keep for general passport setup.
  passport.serializeUser((user, done) => {
    done(null, user.id); // Assuming user object from findOrCreateUser has an 'id'
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id); // findUserById should return your app user model
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/api/auth/auth0/callback',
    state: true
  }, async (accessToken, refreshToken, extraParams, profile, done) => {
    try {
      const userProfileData = {
        provider: 'auth0',
        providerId: profile.sub || profile.user_id || profile.id, // Use profile.sub or profile.user_id as primary
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.displayName || profile.nickname || (profile.name ? `${profile.name.givenName} ${profile.name.familyName}` : null),
        picture: profile.picture || (profile.photos && profile.photos[0] && profile.photos[0].value)
      };

      if (!userProfileData.email) {
        console.error("Auth0 Profile missing email:", profile);
        return done(new Error("Email not provided by Auth0 profile."), null);
      }
      
      const appUser = await findOrCreateUser(userProfileData);
      return done(null, appUser);
    } catch (err) {
      console.error("Error in Auth0 strategy processing:", err);
      return done(err, null);
    }
  }));

  // Add LinkedIn Strategy Configuration here
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/auth/linkedin/callback',
    scope: ['openid', 'profile', 'email'], // <-- UPDATE THIS LINE
    state: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('LinkedIn OIDC Profile:', JSON.stringify(profile, null, 2)); // Add this line to inspect

      const userProfile = {
        provider: 'linkedin',
        providerId: profile.sub || profile.id, // OIDC often uses 'sub' for subject identifier
        // Adjust these based on the actual profile structure logged above:
        email: profile.email || (profile.emails && profile.emails[0] ? profile.emails[0].value : null),
        name: profile.name || profile.displayName || `${profile.given_name} ${profile.family_name}`,
        picture: profile.picture || (profile.photos && profile.photos[0] ? profile.photos[0].value : null),
      };

      if (!userProfile.email) {
        console.error('Email not found in LinkedIn OIDC profile:', profile);
        return done(new Error('Email not provided by LinkedIn.'), null);
      }

      const user = await findOrCreateUser(userProfile);
      return done(null, user);
    } catch (error) {
      console.error("Error in LinkedIn strategy processing:", error);
      return done(error, null);
    }
  }));
};

export default configurePassport;

// Remove the old router definition from the bottom of this file.
// const router = express.Router(); // REMOVE THIS LINE

// router.get('/auth0/callback', passport.authenticate('auth0', { // REMOVE THIS BLOCK
//   failureRedirect: '/login' 
// }), (req, res) => {

// }); // REMOVE THIS BLOCK