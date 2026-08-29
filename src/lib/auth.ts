import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { detectOriginCampus } from "./campus";

interface Profile42 {
  id: number;
  login: string;
  email: string;
  image?: { link?: string };
  slack_login?: string;
  campus_users?: Array<{ campus?: { name?: string } }>;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    {
      id: "forty-two",
      name: "42 Intra",
      type: "oauth",
      authorization: {
        params: {
          scope: "public",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/forty-two`,
        },
      },
      token: "https://api.intra.42.fr/oauth/token",
      userinfo: "https://api.intra.42.fr/v2/me",
      clientId: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      checks: "state",
      profile(profile: Profile42) {
        const originCampus = detectOriginCampus(profile.campus_users || []);

        return {
          id: profile.id.toString(),
          intraId: profile.id,
          login: profile.login,
          email: profile.email,
          image: profile.image?.link || null,
          slackLogin: profile.slack_login || null,
          originCampus,
          targetCampus: "",
          transferStatus: "SEEKING_SWAP",
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.intraId = u.intraId as number;
        token.originCampus = u.originCampus as string;
        token.targetCampus = u.targetCampus as string;
        token.transferStatus = u.transferStatus as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as unknown as Record<string, unknown>;
        su.intraId = token.intraId as number;
        su.originCampus = token.originCampus as string;
        su.targetCampus = token.targetCampus as string;
        su.transferStatus = token.transferStatus as string;
      }
      return session;
    },
    async signIn({ user }) {
      const u = user as unknown as Record<string, unknown>;
      const intraId = u.intraId as number | undefined;
      if (!intraId) return false;

      const existingUser = await prisma.user.findUnique({
        where: { intraId },
      });

      if (existingUser) {
        return true;
      }

      await prisma.user.create({
        data: {
          intraId,
          login: (u.login as string) || (u.name as string) || "unknown",
          email: user.email,
          image: user.image,
          slackLogin: (u.slackLogin as string) || null,
          originCampus: (u.originCampus as string) || "Unknown",
          targetCampus: (u.targetCampus as string) || "",
          transferStatus: "SEEKING_SWAP",
        },
      });

      return true;
    },
  },
};
