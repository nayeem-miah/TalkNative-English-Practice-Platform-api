/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from '@prisma/client';
import HttpStatus from 'http-status';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import ApiError from '../errors/apiError';
import { prisma } from '../prisma/prisma';
import config from './index';

passport.use(
  new GoogleStrategy(
    {
      clientID: (config.google.clientId || 'GOOGLE_CLIENT_ID_PLACEHOLDER') as string,
      clientSecret: (config.google.clientSecret || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER') as string,
      callbackURL: config.google.callbackUrl as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new ApiError(HttpStatus.BAD_REQUEST, 'No email found in Google account profile'), undefined);
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User',
              profilePicture: profile.photos?.[0]?.value || null,
              role: UserRole.USER,
              isVerified: true,
              status: UserStatus.ACTIVE,
            },
          });
        } else {
          const updateData: Record<string, any> = {};
          if (!user.isVerified) {
            updateData.isVerified = true;
          }
          if (!user.profilePicture && profile.photos?.[0]?.value) {
            updateData.profilePicture = profile.photos[0].value;
          }

          if (Object.keys(updateData).length > 0) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
          }
        }

        if (user.status === UserStatus.SUSPENDED) {
          return done(
            new ApiError(HttpStatus.FORBIDDEN, `Your account has been suspended. Reason: ${user.suspensionReason || 'Not specified'}`),
            undefined
          );
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
