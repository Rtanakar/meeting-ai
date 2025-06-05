import { auth } from "@/lib/auth";
import SignInView from "@/modules/auth/ui/views/sign-in-view";
// Uses server-only hooks like headers() and redirect()

// A helper from Next.js to access HTTP headers on the server side.
// Next.js function to access HTTP headers to both req and res
import { headers } from "next/headers";

import { redirect } from "next/navigation";

const SignIn = async () => {
  // Retrieves the current user session on the server using request headers.
  // headers() returns the HTTP headers, including cookies (which often contain session info).
  // auth.api.getSession() uses these headers to check for an existing session
  const session = await auth.api.getSession({
    // headers() gets the current request headers
    headers: await headers(),
  });

  // If a session exists (meaning the user is already logged in), it redirects to the home page (/).
  // !!session converts any truthy value to a boolean true.
  // !!session converts the session object to a boolean (true if session exists)
  // If a session exists, the user is redirected to the homepage ("/")
  if (!!session) {
    redirect("/");
  }

  // Else, show the sign-in page.
  // If the user is not logged in, it renders the sign-in UI.
  // If no session exists, the component renders the SignInView which presumably contains
  return <SignInView />;
};

export default SignIn;
