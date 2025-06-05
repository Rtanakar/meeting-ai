import { db } from "@/db"; // db: डेटाबेस कनेक्शन के लिए
import { agents } from "@/db/schema"; // agents: एजेंट्स टेबल की स्कीमा (संरचना)

// createTRPCRouter: API एंडपॉइंट्स का संग्रह बनाता है
// protectedProcedure: सुरक्षित प्रक्रिया जिसके लिए प्रमाणीकरण (login) आवश्यक है
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import { z } from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
  // इसका मतलब है कि getOne एंडपॉइंट को एक्सेस करने के लिए यूजर को लॉगिन होना आवश्यक है।
  // getOne - एक एजेंट की जानकारी प्राप्त करना
  getOne: protectedProcedure
    .input(z.object({ id: z.string() })) // ID की जाँच
    .query(async ({ input }) => {
      const [existingAgent] = await db
        .select({
          // TODO: Change to actual count
          meetingCount: sql<number>`5`, // अस्थायी रूप से 5 सेट किया गया
          ...getTableColumns(agents), // टेबल के सभी कॉलम
        })
        .from(agents)
        .where(eq(agents.id, input.id)); // दिए गए ID से खोजें

      return existingAgent; // एजेंट डेटा वापस करें
    }),

  // getMany - सभी एजेंट्स की सूची प्राप्त करना
  getMany: protectedProcedure.query(async () => {
    const data = await db
      .select({
        // TODO: Change to actual count
        meetingCount: sql<number>`3`,
        ...getTableColumns(agents),
      })
      .from(agents);

    return data; // सभी एजेंट्स की सूची
  }),

  // create - नया एजेंट बनाना
  create: protectedProcedure
    .input(agentsInsertSchema) // इनपुट की जाँच // इनपुट: (agentsInsertSchema) के अनुसार डेटा // <-- (agentsInsertSchema) यहाँ इस स्कीमा का उपयोग होता है
    .mutation(async ({ input, ctx }) => {
      // create एक म्यूटेशन है (नया डेटा बना रहा है)
      const [createdAgent] = await db
        .insert(agents) // डेटाबेस में नया एजेंट इन्सर्ट करता है // टेबल में डेटा डालें
        .values({
          ...input, // फ्रंटएंड से डेटा
          userId: ctx.auth.user.id, // लॉगिन यूजर का ID
        }) // वर्तमान यूजर का ID (ctx.auth.user.id) भी जोड़ता है
        .returning(); // नया बना रिकॉर्ड वापस लें // नए बने एजेंट की जानकारी रिटर्न करता है

      return createdAgent; // नया एजेंट वापस करें
    }),
});
