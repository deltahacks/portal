export type Waiver = {
  id: string;
  eventName: string;
  title: string;
  // PDF in /public, shown as-is in the waiver popup.
  pdfUrl: string;
};

// Event waivers from the Events team. Hackers must scroll through each one
// before they can accept it, and accept all of them before they can RSVP.
export const rsvpWaivers: Waiver[] = [
  {
    id: "spicyFireNoodle",
    eventName: "Fire Noodle Challenge",
    title: "Spicy Fire Noodle Challenge Waiver",
    pdfUrl: "/waivers/spicy-fire-noodle-waiver.pdf",
  },
  {
    id: "pingPong",
    eventName: "Ping Pong",
    title: "Ping Pong Waiver",
    pdfUrl: "/waivers/ping-pong-waiver.pdf",
  },
];

// Consent text shown above the waivers in the RSVP modal. The events with
// elevated risks are listed between the two parts.
export const rsvpConsentIntro = [
  "By accepting below, you agree to release DeltaHacks from all liability relating to injuries that may occur at the event, regardless of whether the injuries are caused by negligence.",
  "I acknowledge that different events have different risks. The following events have elevated risks. By participating in any of these events, you acknowledge that you are participating in the events voluntarily, you have read the following waivers for each event, and that you accept these risks.",
];

export const rsvpConsentClosing =
  "Once again, by accepting below, you forfeit all rights to bring a suit against DeltaHacks for any reason. You are agreeing to make every effort to obey safety precautions as listed in writing and as explained verbally. You agree to ask for clarification when needed.";
