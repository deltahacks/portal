import { useState } from "react";
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

const UpdateStatusDropdown = ({
  id,
  status: srcStatus,
  className,
  position,
}: {
  id: string;
  status: Status;
  className?: string;
  position?: string;
}) => {
  const utils = trpc.useUtils();
  const updateStatus = trpc.reviewer.updateStatus.useMutation({
    onSettled() {
      utils.reviewer.getApplications.invalidate();
    },
  });
  const statusTypes = Object.keys(Status) as Status[];

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
                onClick={async () => {
                  updateStatus.mutateAsync({
                    id,
                    status: status,
                  });
                }}
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
