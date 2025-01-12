interface ProjectData {
  name: string;
  description: string;
  link: string;
  tracks: string[];
  status: string;
  // Add other common fields as needed
}

export interface CSVProcessor {
  processCSVData(data: any[]): ProjectData[];
}

// Utility function for track processing
const getTrackList = (data: string): string[] => {
  if (!data) {
    return [];
  }
  return data.split(",").map((track) => track.trim());
};

export class DevpostCSVProcessor implements CSVProcessor {
  processCSVData(data: any[]): ProjectData[] {
    return data.map((row) => ({
      name: row["Project Title"],
      status: row["Project Status"],
      description: row["About The Project"],
      link: row["Submission Url"],
      tracks: getTrackList(row["Opt-In Prizes"]),
      // Add other fields as needed
    }));
  }
}

export class DoraHacksCSVProcessor implements CSVProcessor {
  processCSVData(data: any[]): ProjectData[] {
    return data.map((row) => ({
      name: row["BUIDL name"], // Different column name
      status: "Submitted",
      description: "", // Dora hacks doesn't have a description bruh!
      link: row["BUIDL URL"], // Different column name
      tracks: getTrackList(row["Track"]), // Different column name
      // Add other fields as needed
    }));
  }
}
