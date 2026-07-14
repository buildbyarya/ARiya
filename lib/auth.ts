import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"


export const authOptions = {

  adapter: PrismaAdapter(prisma),


  secret: process.env.NEXTAUTH_SECRET,


  debug: true,


  providers: [

    GoogleProvider({

      clientId: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

    }),

  ],


}