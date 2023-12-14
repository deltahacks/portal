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

const StatusDropdown = ({
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
  const [displayedStatus, setDisplayedStatus] = useState(srcStatus);
  const updateStatus = trpc.reviewer.updateStatus.useMutation();

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
            <div>{displayedStatus}</div>
            <ChevronDown className="pl-2 h-4 w-6 float-right" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusTypes
            .filter((status) => status !== displayedStatus)
            .map((status) => (
              <DropdownMenuItem
                key={status}
                className="capitalize"
                onClick={async () => {
                  setDisplayedStatus(status);
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

export default StatusDropdown;
