import passport from "passport";
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../../authors/schema.js";
import { generateJwt } from "./jwt.js";


const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_OAUTH_ID,
        clientSecret: process.env.GOOGLE_OAUTH_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL
    },
    async (accessToken, refreshToken, profile, passportNext) => {
        // 1. Check if the user is already in the database

        console.log(profile)

        const user = await AuthorModel.findOne({ googleId: profile.id })

        // 2. If so, generate a token with that user id
        console.log(user)

        if (user) {
            const token = await generateJwt({ id: user._id.toString() })

            console.log(user._id)
            passportNext(null, { token })
        }

        // 3. else create a user and generate a token with the newly created user id
        else {
            const user = new AuthorModel({
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                googleId: profile.id
            })

            await user.save()

            console.log(user._id)

            const token = await generateJwt({ id: user._id.toString() })

            passportNext(null, { token })
        }


    }
);

passport.serializeUser(function (userData, passportNext) {
    passportNext(null, userData)
})

export default googleStrategy;