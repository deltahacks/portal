import { Status } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { trpc } from "../utils/trpc";
import { Button } from "./Button";
import { cn } from "../utils/mergeTailwind";
import { useSession } from "next-auth/react";

const UpdateStatusDropdown = ({
  id,
  className,
  position,
}: {
  id: string;
  className?: string;
  position?: string;
}) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.includes?.("ADMIN") ?? false;

  const utils = trpc.useUtils();
  const { data } = trpc.reviewer.getStatus.useQuery({ id });
  const updateStatus = trpc.reviewer.updateStatus.useMutation({
    onSettled() {
      utils.reviewer.getStatus.invalidate({ id });
      utils.application.getStatusCount.invalidate();
    },
  });

  const srcStatus = data?.status;
  const statusTypes = Object.keys(Status) as Status[];

  const handleUpdateStatus = async (status: Status) => {
    try {
      await updateStatus.mutateAsync({
        id,
        status,
      });
    } catch (e) {
      console.log(e);
    }
  };

  // If the user is not an admin, they should not be able to update the status
  if (!isAdmin) {
    return (
      <div className={position}>
        <Button className={className} variant="outline" disabled>
          <div>{srcStatus}</div>
        </Button>
      </div>
    );
  }

  return (
    <div className={position}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn("justify-between w-36", className)}
            variant="outline"
          >
            <span className="sr-only">Open menu</span>
            <div>{srcStatus}</div>
            <ChevronDown className="pl-2 h-4 w-6 float-right" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusTypes
            .filter((status) => status !== srcStatus)
            .map((status) => (
              <DropdownMenuItem
                key={status}
                className="capitalize"
                onClick={() => handleUpdateStatus(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UpdateStatusDropdown;
