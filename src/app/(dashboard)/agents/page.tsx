import { Suspense } from "react"; // Suspense: async components के लिए fallback दिखाने के लिए।
import { ErrorBoundary } from "react-error-boundary"; // ErrorBoundary: अगर कोई error आए तो fallback UI दिखाने के लिए।
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"; // dehydrate और HydrationBoundary: SSR (server-side rendering) में React Query का डेटा hydrate करने के लिए।

import { getQueryClient, trpc } from "@/trpc/server"; //getQueryClient(): React Query का server-side client देता है।

import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
import AgentListHeader from "@/modules/agents/ui/components/agent-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers"; // headers(): server पर current HTTP headers access करता है।
import { redirect } from "next/navigation"; // redirect(): server पर तुरंत redirect करता है।
import type { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/agents/params";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  //   🔹 सबसे पहले:
  // - यह check करता है कि current user logged in है या नहीं।
  // - auth.api.getSession() headers के साथ session देता है।
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 🔹 अगर session नहीं मिला (user लॉगइन नहीं है), तो इसे /auth/sign-in पेज पर भेज दिया जाता है।
  if (!session) {
    redirect("/auth/sign-in");
  }

  //   🔹 अगर user authenticated है:
  // - एक React Query client बनाया जाता है।
  // - trpc.agents.getMany query को पहले से ही prefetch कर लिया जाता है ताकि page तेज़ी से load हो।

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <AgentListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;

// 1: पहले user की authentication चेक करता है।

// 2: अगर user लॉगइन नहीं है, तो sign-in पेज पर redirect करता है।

// 3: अगर लॉगइन है, तो:

// - React Query से data को prefetch करता है।

// - View को Suspense और Error Boundary के साथ render करता है।

// ┌─────────────────────────────┐
// │     User visits page        │
// └────────────┬────────────────┘
//              │
//              ▼
// ┌─────────────────────────────┐
// │ Get session from auth API   │
// │ using request headers       │
// └────────────┬────────────────┘
//              │
//      ┌───────▼──────────┐
//      │ session exists?  │
//      └───────┬──────────┘
//              │ Yes                    No
//              ▼                         ▼
// ┌─────────────────────────────┐   ┌────────────────────────────┐
// │ Prefetch agents list query  │   │ redirect("/auth/sign-in")  │
// │ using React Query + TRPC    │   └────────────────────────────┘
// └────────────┬────────────────┘
//              │
//              ▼
// ┌────────────────────────────────────────────────────┐
// │ <AgentListHeader />                                │
// │ <HydrationBoundary>                                │
// │   <Suspense fallback={<AgentsViewLoading />}>      │
// │     <ErrorBoundary fallback={<AgentsViewError />}> │
// │       <AgentsView />                               │
// │     </ErrorBoundary>                               │
// │   </Suspense>                                      │
// │ </HydrationBoundary>                               │
// └────────────────────────────────────────────────────┘
