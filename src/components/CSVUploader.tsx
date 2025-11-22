import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import Papa from "papaparse";
import { CSVProcessor } from "../utils/csvProcessors";

interface CSVUploaderProps {
  csvProcessor: CSVProcessor;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ csvProcessor }) => {
  const uploadProjectsMutation = trpc.project.uploadProjects.useMutation({});

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        const processedData = csvProcessor.processCSVData(results.data);
        const data = processedData
          .filter((obj) => {
            return Object.values(obj).some(
              (value) => value !== "" && value !== undefined && value !== null,
            );
          })
          .filter((obj) => {
            return obj.name !== "Untitled";
          });

        uploadProjectsMutation.mutate(data);
      },
      error: function (error) {
        console.error(`CSV parsing error: ${error.message}`);
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
            disabled={uploadProjectsMutation.isPending}
          />
        </div>
        {uploadProjectsMutation.isPending && (
          <div className="mb-4">
            <p className="text-blue-400 dark:text-blue-500">Uploading...</p>
          </div>
        )}
        {uploadProjectsMutation.isSuccess && (
          <div className="mb-4">
            <p className="text-green-400 dark:text-green-500">
              Upload successful!
            </p>
          </div>
        )}
        {uploadProjectsMutation.isError && (
          <div className="mb-4">
            <p className="text-red-400 dark:text-red-500">
              Error: {uploadProjectsMutation.error?.message}
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
