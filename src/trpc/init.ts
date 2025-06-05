import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// मतलब: यह एक बेसिक/सामान्य TRPC प्रक्रिया है
// विशेषता: कोई विशेष जाँच नहीं करता, सीधे एक्सेस करने देता है
export const baseProcedure = t.procedure;

// मतलब: यह एक सुरक्षित प्रक्रिया है जिसमें अतिरिक्त जाँच होती है
// विशेषता: केवल प्रमाणित (authenticated) यूजर्स को ही एक्सेस देता है
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // protectedProcedure का विस्तृत कार्य

  // यूजर के सत्र (login स्थिति) की जानकारी प्राप्त करता है
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // अगर यूजर लॉगिन नहीं है (कोई सत्र नहीं), तो एरर थ्रो करता है
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  // सत्र जानकारी को संदर्भ (context) में जोड़ता है // अगले मिडलवेयर/प्रक्रिया को आगे बढ़ाता है
  return next({ ctx: { ...ctx, auth: session } });
});

// 1: सुरक्षा (Security):
// केवल लॉगिन यूजर्स ही प्रोटेक्टेड API एंडपॉइंट्स का उपयोग कर सकते हैं

// 2: यूजर जानकारी एक्सेस:
// सभी प्रोटेक्टेड रूट्स में ctx.auth के माध्यम से यूजर सत्र तक पहुँच

// 3: कोड पुन: उपयोग (Reusability):
// एक बार बनाने के बाद कई एंडपॉइंट्स पर लागू किया जा सकता है

// 4: केंद्रीकृत प्रमाणीकरण:
// सभी प्रोटेक्टेड रूट्स के लिए एक ही जगह पर ऑथेंटिकेशन लॉजिक
