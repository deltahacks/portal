export type Waiver = {
  id: string;
  title: string;
  // PDF in /public, shown as-is in the waiver popup.
  pdfUrl: string;
};

// Event waivers from the Events team. Hackers must scroll through each one
// before they can accept it, and accept all of them before they can RSVP.
export const rsvpWaivers: Waiver[] = [
  {
    id: "spicyFireNoodle",
    title: "Spicy Fire Noodle Challenge Waiver",
    pdfUrl: "/waivers/spicy-fire-noodle-waiver.pdf",
  },
  {
    id: "pingPong",
    title: "Ping Pong Waiver",
    pdfUrl: "/waivers/ping-pong-waiver.pdf",
  },
];
