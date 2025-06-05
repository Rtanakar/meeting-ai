import {
  CommandResponsiveDialog,
  // CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardCommand = ({ open, setOpen }: Props) => {
  return (
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent" />
      <CommandList>
        <CommandItem>Test</CommandItem>
      </CommandList>
    </CommandResponsiveDialog>

    //  <CommandDialog open={open} onOpenChange={setOpen}>
    //     <CommandInput placeholder="Find a meeting or agent" />
    //     <CommandList>
    //       <CommandItem>Test</CommandItem>
    //     </CommandList>
    //   </CommandDialog>
  );
};

export default DashboardCommand;
