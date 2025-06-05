import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { AgentGetOne } from "../../types";

import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import GeneratedAvatar from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentFormProps {
  onSuccess?: () => void; // Callback after successful submission
  onCancel?: () => void; // Callback when form is canceled
  initialValues?: AgentGetOne; // Pre-filled values for edit mode
}

const AgentForm = ({ onSuccess, onCancel, initialValues }: AgentFormProps) => {
  const trpc = useTRPC(); // useTRPC(): TRPC क्लाइंट को एक्सेस करने के लिए
  const queryClient = useQueryClient(); // useQueryClient(): React Query क्लाइंट को एक्सेस करने के लिए

  // म्यूटेशन लॉजिक (createAgent)
  // useMutation(): डेटा म्यूटेशन (create/update) के लिए
  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        // Refresh agent lists in cache
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions());

        // Additional cache invalidation for edit mode
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id })
          );
        }
        onSuccess?.(); // सफलता कॉलबैक // Success callback
      },
      onError: (error) => {
        toast.error(error.message); // Error notification

        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    })
  );

  // फॉर्म सेटअप
  // useForm(): फॉर्म स्टेट और वैलिडेशन के लिए
  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema), // Zod वैलिडेशन // Zod validation
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createAgent.isPending;

  // सबमिट हैंडलर
  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      console.log("TODO: updateAgent"); // अपडेट लॉजिक (भविष्य के लिए) // Placeholder for update functionality
    } else {
      createAgent.mutate(values); // नया एजेंट बनाएं // Create new agent
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* एजेंट के नाम के आधार पर ऑटो-जनरेटेड अवतार */}
        <GeneratedAvatar
          seed={form.watch("name")}
          variant="botttsNeutral"
          className="border size-16"
        />

        {/* नाम फील्ड: */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Math tutors" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* निर्देश फील्ड: */}
        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="You are a helpful math assistant that can answer questions and help with assignments."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* बटन समूह: */}
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AgentForm;
