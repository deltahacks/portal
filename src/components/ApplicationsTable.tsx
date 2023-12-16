import * as React from "react";
import { Status } from "@prisma/client";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "./Button";
import { ApplicationForReview } from "../server/router/reviewers";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Input } from "./Input";
import { DataTable } from "./Table";
import ApplicationPopupButton from "./Applicant";
import UpdateStatusDropdown from "./UpdateStatusDropdown";

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
    enableColumnFilter: true,
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
    enableColumnFilter: true,
    enableSorting: true,
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
      return (
        <UpdateStatusDropdown id={id} status={status} position="float-right" />
      );
    },
    enableSorting: true,
  },
];

const SelectionDropdown = ({
  selections,
  defaultSelection,
  onChangedSelection,
}: {
  selections: string[];
  defaultSelection: string;
  onChangedSelection?: (selection: string) => void;
}) => {
  const [displayedSelection, setDisplayedSelection] =
    React.useState(defaultSelection);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="justify-between w-60" variant="outline">
          <span className="sr-only">Open menu</span>
          <div>{displayedSelection}</div>
          <ChevronDown className="pl-2 h-4 w-6 float-right" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {selections
          .filter((selection) => selection !== displayedSelection)
          .map((selection) => {
            return (
              <DropdownMenuItem
                key={selection}
                className="capitalize"
                onClick={() => {
                  setDisplayedSelection(selection);
                  if (onChangedSelection) {
                    onChangedSelection(selection);
                  }
                }}
              >
                {selection}
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
      placeholder={`Filter ${column?.id}...`}
      value={(column?.getFilterValue() as string) ?? ""}
      onChange={(event) => column?.setFilterValue(event.target.value)}
      className="max-w-sm"
    />
  );
};

export const ApplicationsTable = ({
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
            <SelectionDropdown
              selections={["NONE", ...Object.keys(Status)]}
              defaultSelection={"NONE"}
              onChangedSelection={(selection) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(selection === "NONE" ? undefined : selection)
              }
            />
          </div>

          <ColumnFilterDropdown columns={table.getAllColumns()} />
        </div>
        <DataTable table={table} />
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Displaying {table.getFilteredRowModel().rows.length} row(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
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
