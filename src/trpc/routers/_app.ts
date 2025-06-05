// createTRPCRouter: TRPC राउटर बनाने का मुख्य फंक्शन
import { createTRPCRouter } from "../init";
// agentsRouter: एजेंट्स से संबंधित सभी API एंडपॉइंट्स वाला राउटर
import { agentsRouter } from "@/modules/agents/server/procedures";

// appRouter (मूल राउटर)
// └── agents (नेस्टेड राउटर)
//     └── getOne (प्रक्रिया)

// कॉल सबसे पहले मुख्य राउटर (appRouter) तक पहुँचती है
// फिर agents सब-राउटर पर रूट होती है
// अंत में getOne प्रक्रिया एक्जिक्यूट होती है

// यहाँ agentsRouter को मुख्य राउटर में नेस्ट किया गया है
// अब सभी एजेंट एंडपॉइंट्स /agents/ प्रीफिक्स के तहत उपलब्ध होंगे
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
});
// export type definition of API

// यह फ्रंटएंड को टाइप सेफ्टी प्रदान करता है
// पूरे API स्ट्रक्चर का टाइप डेफिनिशन बनाता है
export type AppRouter = typeof appRouter;
