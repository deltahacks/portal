import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "./Button";
import { ApplicationForReview } from "../server/router/reviewers";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Input } from "./Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { StatusSchema } from "../../prisma/zod";
import { trpc } from "../utils/trpc";
import { StatusType } from "../../prisma/zod/inputTypeSchemas/StatusSchema";
import ApplicationPopupButton from "./Applicant";

const columns: ColumnDef<ApplicationForReview>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="text-left"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-4 py-2 capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-4 py-2 lowercase">{row.getValue("email")}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "dH10ApplicationId",
    header: "DeltaHacks X Application",
    cell: ({ row }) => {
      return <ApplicationPopupButton applicationForReview={row.original} />;
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          className="float-right"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { id, status } = row.original;
      return <StatusDropdown id={id} status={status} />;
    },
    enableSorting: true,
  },
];

const StatusDropdown = ({
  id,
  status: srcStatus,
}: {
  id: string;
  status: StatusType;
}) => {
  const [displayedStatus, setDisplayedStatus] = React.useState(srcStatus);
  const updateStatus = trpc.reviewer.updateStatus.useMutation();

  const statusTypes = Object.keys(StatusSchema.Enum) as StatusType[];

  return (
    <div className="float-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="justify-between w-36" variant="outline">
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

const StatusFilterDropdown = <TData,>({
  column,
}: {
  column?: Column<TData>;
}) => {
  const [displayedStatus, setDisplayedStatus] = React.useState("NONE");
  const statusFilterTypes = ["NONE", ...Object.keys(StatusSchema.Enum)];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="justify-between w-60" variant="outline">
          <span className="sr-only">Open menu</span>
          <div>{displayedStatus}</div>
          <ChevronDown className="pl-2 h-4 w-6 float-right" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusFilterTypes
          .filter((status) => status !== displayedStatus)
          .map((status) => {
            return (
              <DropdownMenuItem
                key={status}
                className="capitalize"
                onClick={() => {
                  setDisplayedStatus(status);
                  column?.setFilterValue(
                    status === "NONE" ? undefined : status
                  );
                }}
              >
                {status}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ColumnFilterDropdown = <TDef,>({
  columns,
}: {
  columns: Column<TDef>[];
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columns <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SearchBarFilter = <TData,>({ column }: { column?: Column<TData> }) => {
  return (
    <Input
      placeholder="Filter emails..."
      value={(column?.getFilterValue() as string) ?? ""}
      onChange={(event) => column?.setFilterValue(event.target.value)}
      className="max-w-sm"
    />
  );
};

export const DataTable = ({
  applications,
}: {
  applications: ApplicationForReview[];
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable<ApplicationForReview>({
    data: applications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="bg-white dark:border-zinc-700 dark:bg-zinc-950 p-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative rounded-md border">
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center flex-row">
            <SearchBarFilter column={table.getColumn("email")} />
            <div className="text-right w-72 pr-4">Status Filter:</div>
            <StatusFilterDropdown column={table.getColumn("status")} />
          </div>

          <ColumnFilterDropdown columns={table.getAllColumns()} />
        </div>
        <div className="rounded-md border dark:border-zinc-700">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Displaying {table.getFilteredRowModel().rows.length} row(s).
          </div>
          <div className="space-x-2 -z-1">
            <Button
              className="z-0"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              className="z-0"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
