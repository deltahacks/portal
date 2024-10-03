export interface FormStructure {
  id: string;
  categories: {
    name: string;
    questions: string[];
  }[];
}

export const FORM_STRUCTURES: FormStructure[] = [
  {
    id: "DeltaHacks X Application Form",
    categories: [
      {
        name: "Personal Information",
        questions: [
          "First Name",
          "Last Name",
          "Birthday",
          "Link to Resume",
          "Would you like to be a part of the McMaster Experience Ventures Program?",
        ],
      },
      {
        name: "Education",
        questions: [
          "Are you currently enrolled in post-secondary education?",
          "Study Location",
          "Study Degree",
          "Study Major",
          "Year of Study",
          "Expected Graduation",
          "Previous Hackathons Count",
        ],
      },
      {
        name: "Long Answer",
        questions: [
          "DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?",
          "How do you hope to make the most out of your experience at DH10?",
          "Which piece of future technology excites you most and where do you see it going?",
          "You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?",
        ],
      },
      {
        name: "Survey",
        questions: [
          "What are your social media links?",
          "Is there anything else interesting you want us to know or see?",
          "T-shirt Size",
          "What kind of hacker are you?",
          "What workshops are you interested in?",
          "How did you hear about DeltaHacks?",
          "Gender",
          "Race",
          "Do you already have a team?",
          "Would you like to be considered for a coffee chat with a sponsor?",
        ],
      },
      {
        name: "Emergency Contact",
        questions: [
          "Name of Emergency Contact",
          "Relation to Emergency Contact",
          "Emergency Contact Phone Number",
        ],
      },
      {
        name: "MLH Consent",
        questions: [
          "Agree to MLH Code of Conduct",
          "Agree to MLH Privacy Policy",
          "Agree to MLH Communications",
        ],
      },
    ],
  },
];

export const DELTAHACKS_APPLICATION_FORM_CONFIG = {
  id: "DeltaHacksApplication",
  name: "DeltaHacksApplication",
  value: "DeltaHacks X Application Form",
};
