import { auth } from "@/lib/auth";
import SignUpView from "@/modules/auth/ui/views/sign-up-view";

// हेडर्स HTTP (HyperText Transfer Protocol) का एक महत्वपूर्ण हिस्सा होते हैं जो क्लाइंट और सर्वर के बीच अतिरिक्त जानकारी भेजने का काम करते हैं। ये मेटाडेटा की तरह काम करते हैं।
// प्रमाणीकरण (Authentication):  सत्र ID और टोकन्स को ट्रैक करना
// कैशिंग नियंत्रण: ब्राउज़र कैशिंग को मैनेज करना
// सामग्री वार्ता (Content Negotiation): क्लाइंट किस प्रकार का डेटा चाहता है
// सुरक्षा (Security): CORS और अन्य सुरक्षा नीतियाँ
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SignUp = async () => {
  // (session)सत्र - वेब ऐप्लिकेशन में उपयोगकर्ता की जानकारी को अस्थायी रूप से स्टोर करने की एक तकनीक है। यह एक प्रकार का सर्वर-साइड डेटाबेस होता है जो:
  // उपयोगकर्ता के लॉगिन स्टेटस को ट्रैक करता है
  // उपयोगकर्ता से संबंधित डेटा को पेज रीलोड के बाद भी सेव रखता है
  // HTTP (जो स्वभाव से स्टेटलेस है) में स्टेटफुलनेस जोड़ता है
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // जब यूजर साइन-इन पेज पर आता है
  // सर्वर हेडर्स से सत्र(session) ID चेक करता है (आमतौर पर कुकीज के माध्यम से)
  // (session)अगर सत्र मौजूद है (यानी यूजर पहले से लॉगिन है):  यूजर को होमपेज पर रीडायरेक्ट कर देता है

  if (!!session) {
    redirect("/");
  }

  // (session)अगर सत्र मौजूद नहीं है:  साइन-इन फॉर्म दिखाता है
  return <SignUpView />;
};

export default SignUp;
