// यह सेटअप Next.js में आपके TRPC API की नींव है, जो सभी HTTP डिटेल्स को अपने आप हैंडल करते हुए टाइप-सेफ क्लाइंट-सर्वर कम्युनिकेशन को सक्षम बनाता है।

// This setup is the foundation for your TRPC API in Next.js, enabling type-safe client-server communication while handling all the HTTP details automatically.

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc", // TRPC एंडपॉइंट्स का बेस पाथ
    req, // आने वाली रिक्वेस्ट ऑब्जेक्ट
    router: appRouter, // एप्लिकेशन का TRPC राउटर
    createContext: createTRPCContext, // कॉन्टेक्स्ट क्रिएशन फंक्शन
  });
export { handler as GET, handler as POST };

// एक ही हैंडलर को GET और POST दोनों मेथड्स के लिए एक्सपोर्ट करता है

// रूट को दोनों प्रकार की HTTP रिक्वेस्ट्स को हैंडल करने की अनुमति देता है

// 1: रिक्वेस्ट आगमन
// एक क्लाइंट /api/trpc/[procedure] पर रिक्वेस्ट करता है
// Next.js इसे इस हैंडलर पर रूट करता है

// 2: रिक्वेस्ट प्रोसेसिंग
// fetchRequestHandler काम संभालता है और:
// रिक्वेस्ट को पार्स करता है
// निर्धारित करता है कि कौन सा TRPC प्रोसीजर कॉल किया जा रहा है
// TRPC कॉन्टेक्स्ट बनाता है
// इनपुट वैलिडेट करता है

// 3: एक्जीक्यूशन
// रिक्वेस्ट को appRouter में सही प्रोसीजर पर रूट करता है
// बनाए गए कॉन्टेक्स्ट के साथ प्रोसीजर को एक्जीक्यूट करता है

// 4: रिस्पॉन्स
// प्रोसीजर का रिजल्ट रिटर्न करता है
// एरर्स को उचित तरीके से हैंडल करता है
