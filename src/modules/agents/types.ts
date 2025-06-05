// AppRouter: आपके पूरे TRPC API का मुख्य राउटर टाइप
import { AppRouter } from "@/trpc/routers/_app";
// inferRouterOutputs: TRPC का यूटिलिटी टाइप जो राउटर के आउटपुट टाइप्स निकालता है
import { inferRouterOutputs } from "@trpc/server";

// यह agents राउटर के अंदर getOne प्रक्रिया (procedure) के आउटपुट का टाइप बनाता है
export type AgentGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];


// inferRouterOutputs पूरे AppRouter के सभी आउटपुट टाइप्स निकालता है

// ["agents"] से एजेंट्स राउटर के टाइप्स मिलते हैं

// ["getOne"] से विशेष रूप से getOne प्रक्रिया का आउटपुट टाइप मिलता है