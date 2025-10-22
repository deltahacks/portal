import { useEffect, useState } from "react";
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
import { ArrowUpDown, ChevronDown, Filter } from "lucide-react";

import { Button } from "./Button";
import { ApplicationForReview } from "../server/router/reviewers";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SelectionDropdown,
} from "./DropdownMenu";
import { Input } from "./Input";
import { DataTable } from "./Table";
import ApplicationPopupButton from "./Applicant";
import UpdateStatusDropdown from "./UpdateStatusDropdown";
import capitalize from "../utils/capitlize";
import { Status } from "@prisma/client";

const columns: ColumnDef<ApplicationForReview>[] = [
  {
    accessorKey: "index",
    accessorFn: (_row, index) => index,
    filterFn: (row, columnId, filterValue) => {
      return row.getValue(columnId) === Number(filterValue);
    },
    header: ({ column }) => {
      return (
        <Button
          className="text-left"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="pl-4 py-2">{row.getValue("index")}</div>,
    enableColumnFilter: true,
    enableSorting: true,
  },
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
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { DH12ApplicationId } = row.original;
      return (
        <UpdateStatusDropdown
          dh12ApplicationId={DH12ApplicationId}
          position="float-right"
        />
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "reviewCount",
    filterFn: (row, columnId, value) => {
      const rowValue = row.getValue(columnId);
      return rowValue === Number(value);
    },
    header: ({ column }) => {
      return (
        <Button
          className="text-left"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Number of Reviews
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-4 py-2">
        {row.getValue("reviewCount")}{" "}
        {Number(row.getValue("reviewCount")) === 1 ? "review" : "reviews"}
      </div>
    ),
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: "avgScore",
    filterFn: (row, columnId, value) => {
      const rowValue = row.getValue(columnId);
      return rowValue === Number(value);
    },
    header: ({ column }) => {
      return (
        <Button
          className="text-left"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Average Score
          <ArrowUpDown className="pl-2 h-4 w-6" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const score = row.getValue<number>("avgScore");
      return <div className="pl-4 py-2">{score.toFixed(2)}</div>;
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: "DH12ApplicationId",
    header: () => <div className="float-right">DH12 Application</div>,
    cell: ({ row }) => {
      return (
        <div className="float-right">
          <ApplicationPopupButton applicationForReview={row.original} />
        </div>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: true,
  },
];

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

const SearchBarFilter = <TData,>({
  columns,
  defaultColumnToFilter,
  defaultFilterValue,
}: {
  columns: Column<TData>[];
  defaultColumnToFilter?: Column<TData>;
  defaultFilterValue?: string;
}) => {
  if (!defaultColumnToFilter?.getCanFilter()) {
    throw Error("defaultColumnToFilter should exist and be filterable");
  }
  const [filteredColumn, setFilteredColumn] = useState(defaultColumnToFilter);
  const filterableColumnsMap = columns
    .filter((column) => column.getCanFilter())
    .reduce((map, column) => {
      map.set(capitalize(column?.id), column);
      return map;
    }, new Map<string, Column<TData>>());

  const changeFilteredColumnToSelection = (selection: string) => {
    const newFilteredColumn =
      filterableColumnsMap.get(selection) ?? defaultColumnToFilter;
    setFilteredColumn(newFilteredColumn);
    newFilteredColumn.setFilterValue(filteredColumn.getFilterValue());
    filteredColumn.setFilterValue("");
  };

  useEffect(() => {
    filteredColumn.setFilterValue(defaultFilterValue);
  }, [filteredColumn, defaultFilterValue]);

  return (
    <div className="flex flex-row items-center space-x-0 w-full">
      <div className="p-2 pr-3">
        <Filter />
      </div>
      <SelectionDropdown
        className="w-40 rounded-none rounded-l-lg bg-primary font-bold dark:bg-primary text-white hover:text-white dark:text-white hover:bg-primary/60 hover:dark:bg-primary/80"
        selections={Array.from(filterableColumnsMap.keys())}
        defaultSelection={capitalize(defaultColumnToFilter.id)}
        onChangedSelection={changeFilteredColumnToSelection}
      />
      <Input
        placeholder={`Filter ${capitalize(filteredColumn?.id)}...`}
        value={(filteredColumn.getFilterValue() as string) ?? ""}
        onChange={(event) => {
          filteredColumn?.setFilterValue(event.target.value);
        }}
        className="max-w-sm rounded-none rounded-r-lg"
      />
    </div>
  );
};

export const ApplicationsTable = ({
  applications,
}: {
  applications: ApplicationForReview[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
    autoResetPageIndex: false,
  });

  useEffect(() => {
    if (
      table.getRowModel().rows.length === 0 &&
      table.getFilteredRowModel().rows.length !== 0
    ) {
      table.setPageIndex(0);
    }
  }, [
    table.getRowModel().rows.length,
    table.getFilteredRowModel().rows.length,
  ]);

  return (
    <div className="bg-white dark:border-zinc-700 dark:bg-zinc-950 p-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative rounded-md border">
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <SearchBarFilter
            columns={table.getAllColumns()}
            defaultColumnToFilter={table.getColumn("index")}
            defaultFilterValue={""}
          />
          <ColumnFilterDropdown columns={table.getAllColumns()} />
        </div>
        <DataTable table={table} />
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Generated {table.getFilteredRowModel().rows.length} row(s).
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
