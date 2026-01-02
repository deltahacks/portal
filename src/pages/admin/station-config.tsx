import { Role } from "@prisma/client";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useState } from "react";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import Head from "next/head";
import Drawer from "../../components/Drawer";

type StationWithCount = {
  id: string;
  name: string;
  option: string;
  _count: { eventLogs: number };
};

const StationOptionsCard: React.FC<{
  title: string;
  stationName: string;
  options: StationWithCount[];
  onAdd: (stationName: string, option: string) => Promise<void>;
  onEdit: (id: string, option: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdding: boolean;
  isEditing: boolean;
  isDeleting: boolean;
}> = ({
  title,
  stationName,
  options,
  onAdd,
  onEdit,
  onDelete,
  isAdding,
  isEditing,
  isDeleting,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    await onAdd(stationName, inputValue.trim());
    setInputValue("");
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  const handleStartEdit = (station: StationWithCount) => {
    setEditingId(station.id);
    setEditValue(station.option);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    await onEdit(editingId, editValue.trim());
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">{title}</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder={`New ${stationName} option...`}
            className="input input-bordered flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!inputValue.trim() || isAdding}
          >
            <FiPlus className="w-5 h-5" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.length === 0 ? (
            <p className="text-gray-500">No {stationName} options configured</p>
          ) : (
            options.map((station) => (
              <div
                key={station.id}
                className="flex items-center gap-2 px-2 py-1 rounded-md bg-base-300 text-sm"
              >
                {editingId === station.id ? (
                  <>
                    <input
                      type="text"
                      className="input input-xs input-bordered w-24"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <button
                      className="btn btn-success btn-xs btn-square"
                      onClick={handleSaveEdit}
                      disabled={isEditing || !editValue.trim()}
                    >
                      <FiCheck className="w-3 h-3" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs btn-square"
                      onClick={handleCancelEdit}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{station.option}</span>
                    {station._count.eventLogs > 0 ? (
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={() => handleStartEdit(station)}
                        title="Edit (has references)"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                    ) : deleteConfirm === station.id ? (
                      <div className="flex gap-1">
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() => handleDelete(station.id)}
                          disabled={isDeleting}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={() => setDeleteConfirm(station.id)}
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StationConfig: NextPage = () => {
  const utils = trpc.useUtils();
  const { data: stations, isPending } = trpc.scanner.listStations.useQuery();

  const createStation = trpc.scanner.createStation.useMutation({
    onSuccess: () => {
      utils.scanner.listStations.invalidate();
    },
  });

  const updateStation = trpc.scanner.updateStation.useMutation({
    onSuccess: () => {
      utils.scanner.listStations.invalidate();
    },
  });

  const deleteStation = trpc.scanner.deleteStation.useMutation({
    onSuccess: () => {
      utils.scanner.listStations.invalidate();
    },
  });

  const handleAdd = async (stationName: string, option: string) => {
    await createStation.mutateAsync({ name: stationName, option });
  };

  const handleEdit = async (id: string, option: string) => {
    await updateStation.mutateAsync({ id, option });
  };

  const handleDelete = async (id: string) => {
    await deleteStation.mutateAsync({ id });
  };

  return (
    <>
      <Head>
        <title>Station Config - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Station Config
          </h1>

          {isPending ? (
            <div className="flex justify-center items-center py-12">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <div className="space-y-8">
              <StationOptionsCard
                title="Food Options"
                stationName="food"
                options={stations?.food || []}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdding={createStation.isPending}
                isEditing={updateStation.isPending}
                isDeleting={deleteStation.isPending}
              />
              <StationOptionsCard
                title="Event Options"
                stationName="events"
                options={stations?.events || []}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdding={createStation.isPending}
                isEditing={updateStation.isPending}
                isDeleting={deleteStation.isPending}
              />
            </div>
          )}
        </main>
      </Drawer>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output
  );
  return output;
}

export default StationConfig;
