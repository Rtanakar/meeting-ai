import { db } from "@/db"; // db: डेटाबेस कनेक्शन के लिए
import { agents } from "@/db/schema"; // agents: एजेंट्स टेबल की स्कीमा (संरचना)

// createTRPCRouter: API एंडपॉइंट्स का संग्रह बनाता है
// protectedProcedure: सुरक्षित प्रक्रिया जिसके लिए प्रमाणीकरण (login) आवश्यक है
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
  // इसका मतलब है कि getOne एंडपॉइंट को एक्सेस करने के लिए यूजर को लॉगिन होना आवश्यक है।
  // getOne - एक एजेंट की जानकारी प्राप्त करना
  getOne: protectedProcedure
    .input(z.object({ id: z.string() })) // ID की जाँच
    .query(async ({ input, ctx }) => {
      const [existingAgent] = await db
        .select({
          // TODO: Change to actual count
          meetingCount: sql<number>`5`, // अस्थायी रूप से 5 सेट किया गया
          ...getTableColumns(agents), // टेबल के सभी कॉलम
        })
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id))
        ); // दिए गए ID से खोजें

      if (!existingAgent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not fount" });
      }

      return existingAgent; // एजेंट डेटा वापस करें
    }),

  // getMany - सभी एजेंट्स की सूची प्राप्त करना
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize } = input;

      const data = await db
        .select({
          // TODO: Change to actual count
          meetingCount: sql<number>`3`,
          ...getTableColumns(agents),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined
          )
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined
          )
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        // सभी एजेंट्स की सूची
        items: data,
        total: total.count,
        totalPages,
      };
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
