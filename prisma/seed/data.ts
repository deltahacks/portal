import { FormStructure } from "../../src/server/router/formBuilder";

export const FORM_STRUCTURES: FormStructure[] = [
  {
    name: "DeltaHacks X Application Form",
    formItems: [
      { itemType: "category", statement: "Personal Information" },
      { itemType: "question", statement: "First Name" },
      { itemType: "question", statement: "Last Name" },
      { itemType: "question", statement: "Birthday" },
      { itemType: "question", statement: "Link to Resume" },
      {
        itemType: "question",
        statement:
          "Would you like to be a part of the McMaster Experience Ventures Program?",
      },
      { itemType: "category", statement: "Education" },
      {
        itemType: "question",
        statement: "Are you currently enrolled in post-secondary education?",
      },
      { itemType: "question", statement: "Study Location" },
      { itemType: "question", statement: "Study Degree" },
      { itemType: "question", statement: "Study Major" },
      { itemType: "question", statement: "Year of Study" },
      { itemType: "question", statement: "Expected Graduation" },
      { itemType: "question", statement: "Previous Hackathons Count" },
      { itemType: "category", statement: "Long Answer" },
      {
        itemType: "question",
        statement:
          "DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?",
      },
      {
        itemType: "question",
        statement:
          "How do you hope to make the most out of your experience at DH10?",
      },
      {
        itemType: "question",
        statement:
          "Which piece of future technology excites you most and where do you see it going?",
      },
      {
        itemType: "question",
        statement:
          "You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?",
      },
      { itemType: "category", statement: "Survey" },
      { itemType: "question", statement: "What are your social media links?" },
      {
        itemType: "question",
        statement:
          "Is there anything else interesting you want us to know or see?",
      },
      { itemType: "question", statement: "T-shirt Size" },
      { itemType: "question", statement: "What kind of hacker are you?" },
      {
        itemType: "question",
        statement: "What workshops are you interested in?",
      },
      { itemType: "question", statement: "How did you hear about DeltaHacks?" },
      { itemType: "question", statement: "Gender" },
      { itemType: "question", statement: "Race" },
      { itemType: "question", statement: "Do you already have a team?" },
      {
        itemType: "question",
        statement:
          "Would you like to be considered for a coffee chat with a sponsor?",
      },
      { itemType: "category", statement: "Emergency Contact" },
      { itemType: "question", statement: "Name of Emergency Contact" },
      { itemType: "question", statement: "Relation to Emergency Contact" },
      { itemType: "question", statement: "Emergency Contact Phone Number" },
      { itemType: "category", statement: "MLH Consent" },
      { itemType: "question", statement: "Agree to MLH Code of Conduct" },
      { itemType: "question", statement: "Agree to MLH Privacy Policy" },
      { itemType: "question", statement: "Agree to MLH Communications" },
    ],
  },
];

export const DELTAHACKS_APPLICATION_FORM_CONFIG = {
  id: "CurrentDeltaHacksApplication",
  name: "deltaHacksApplicationFormId",
  value: "fewadghtregfdasf", // unique id of form
};
