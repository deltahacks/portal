import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import Papa from "papaparse";

export const CSVUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadProjectsMutation = trpc.project.uploadProjects.useMutation({
    onSuccess: () => {
      setUploadStatus("success");
      setIsUploading(false);
    },
    onError: (error) => {
      setUploadStatus("error");
      setErrorMessage(error.message);
      setIsUploading(false);
    },
  });

  const processCSVData = (data: any[]) => {
    return data.map((row) => ({
      name: row["Project Title"],
      description: row["About The Project"],
      link: row["Submission Url"],
      status: row["Project Status"],
      judgingStatus: row["Judging Status"],
      highestStepCompleted: row["Highest Step Completed"],
      createdAt: row["Project Created At"],
      tryItOutLinks: row["Try it out Links"],
      videoDemo: row["Video Demo Link"],
      tracks: row["Opt-In Prizes"],
      builtWith: row["Built With"],
      notes: row["Notes"],
      team: {
        colleges: row["Team Colleges/Universities"],
        additionalMemberCount: parseInt(
          row["Additional Team Member Count"],
          10
        ),
      },
    }));
  };

  const getTrackList = (data: string) => {
    if (!data) {
      return [];
    }
    return data.split(",").map((track) => track.trim());
  };

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage(null);

    Papa.parse(file, {
      header: true,
      complete: function (results) {
        const processedData = processCSVData(results.data);
        const data = processedData
          .map(({ name, description, link, tracks }) => ({
            name,
            description,
            link,
            tracks: getTrackList(tracks),
          }))
          .filter((obj) => {
            return Object.values(obj).some(
              (value) => value !== "" && value !== undefined && value !== null
            );
          })
          .filter((obj) => {
            return obj.name !== "Untitled" && obj.tracks.length > 0;
          });

        uploadProjectsMutation.mutate(data);
      },
      error: function (error) {
        setUploadStatus("error");
        setErrorMessage(`CSV parsing error: ${error.message}`);
        setIsUploading(false);
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-md p-6 bg-neutral-900 dark:bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-white dark:text-gray-900">
          Upload Project Export
        </h2>
        <div className="mb-4">
          <label
            className="block text-white dark:text-gray-900 text-sm font-bold mb-2"
            htmlFor="csv-upload"
          >
            Choose CSV file
          </label>
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileChange}
            className="shadow appearance-none border border-gray-600 dark:border-gray-300 rounded w-full py-2 px-3 text-white dark:text-gray-900 bg-neutral-800 dark:bg-white leading-tight focus:outline-none focus:shadow-outline"
            disabled={isUploading}
          />
        </div>
        {isUploading && (
          <div className="mb-4">
            <p className="text-blue-400 dark:text-blue-500">Uploading...</p>
          </div>
        )}
        {uploadStatus === "success" && (
          <div className="mb-4">
            <p className="text-green-400 dark:text-green-500">
              Upload successful!
            </p>
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="mb-4">
            <p className="text-red-400 dark:text-red-500">
              Error: {errorMessage}
            </p>
          </div>
        )}
        <div className="text-sm text-gray-400 dark:text-gray-600 mt-4">
          <p>Accepted file format: .csv</p>
        </div>
      </div>
    </div>
  );
};