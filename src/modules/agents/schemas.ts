import { z } from "zod";

// z.object(): एक ऑब्जेक्ट की संरचना को परिभाषित करता है
// दो फील्ड्स: name और instructions
export const agentsInsertSchema = z.object({
  // प्रकार: स्ट्रिंग (z.string()) // कम से कम 1 वर्ण लंबा होना चाहिए (.min(1)) खाली नहीं हो सकता // एरर मैसेज: अगर वैध नहीं है तो "Name is required" दिखेगा
  name: z.string().min(1, { message: "Name is required" }),
  // प्रकार: स्ट्रिंग (z.string()) // कम से कम 1 वर्ण लंबा होना चाहिए खाली नहीं हो सकता // एरर मैसेज: अगर वैध नहीं है तो "Instructions are required" दिखेगा
  instructions: z.string().min(1, { message: "Instructions are required" }),
});

export const agentUpdateSchema = agentsInsertSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});
