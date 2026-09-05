import NextAuth from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school";

const handler = NextAuth({
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID!,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
