import { env } from "../../../../../env/server.mjs";
import path from "path";
import { google, walletobjects_v1 } from "googleapis";
import jwt from "jsonwebtoken";

import { assert } from "../../../../../utils/assert";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const issuerId = "3388000000022980027";
  const classId = "deltahacks";
  const userId = (await params).id;

  const auth = new google.auth.GoogleAuth({
    keyFile: "google-wallet-service-key.json",
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });

  const client = google.walletobjects({
    version: "v1",
    auth,
  });

  const eventTicketClass = createClass(issuerId, classId);
  try {
    await client.eventticketclass.get({
      resourceId: `${issuerId}.${classId}`,
    });
    try {
      await client.eventticketclass.update({
        resourceId: `${issuerId}.${classId}`,
        requestBody: eventTicketClass,
      });
    } catch (err) {
      console.error("Error updating event ticket class:", err);
      return new Response("Error updating event ticket class", {
        status: 500,
      });
    }
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      try {
        await client.eventticketclass.insert({
          requestBody: eventTicketClass,
        });
      } catch (err) {
        console.error("Error creating event ticket class:", err);
        return new Response("Error creating event ticket class", {
          status: 500,
        });
      }
    } else {
      return new Response("Error checking event ticket class", { status: 500 });
    }
  }

  const newObject = createObject(issuerId, userId, classId);
  try {
    await client.eventticketobject.get({
      resourceId: `${issuerId}.${userId}`,
    });
    try {
      await client.eventticketobject.update({
        resourceId: `${issuerId}.${userId}`,
        requestBody: newObject,
      });
    } catch (err) {
      console.error("Error updating event ticket object:", err);
      return new Response("Error updating event ticket object", {
        status: 500,
      });
    }
  } catch (err: any) {
    if (err.response && err.response.status !== 404) {
      return new Response("Error checking object", { status: 500 });
    }

    try {
      const response = await client.eventticketobject.insert({
        requestBody: newObject,
      });

      console.log("Pass created successfully:", response);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error creating pass:", err);
      return new Response("Error creating pass", { status: 500 });
    }
  }

  const credentials = await auth.getCredentials();
  const jwtClaims = {
    iss: credentials.client_email,
    aud: "google",
    origins: [env.NEXTAUTH_URL],
    typ: "savetowallet",
    payload: {
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [newObject],
    },
  };

  assert(credentials.private_key, "Private key is required");
  let token = jwt.sign(jwtClaims, credentials.private_key, {
    algorithm: "RS256",
  });

  return Response.redirect(`https://pay.google.com/gp/v/save/${token}`, 302);
};

function createClass(
  issuerId: string,
  classId: string
): walletobjects_v1.Schema$EventTicketClass {
  return {
    id: `${issuerId}.${classId}`,
    issuerName: "DeltaHacks",
    multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ONE_DEVICE",
    countryCode: "CA",
    logo: {
      sourceUri: {
        uri: "https://i.imgur.com/OynK4zp_d.webp?maxwidth=760&fidelity=grand",
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "DeltaHacks XII Logo",
        },
      },
    },
    reviewStatus: "UNDER_REVIEW",
    eventName: {
      defaultValue: {
        language: "en-US",
        value: "Deltahacks XII",
      },
    },
    eventId: "deltahacks-xii",
    venue: {
      name: {
        defaultValue: {
          language: "en-US",
          value: "Peter George Centre for Living and Learning",
        },
      },
      address: {
        defaultValue: {
          language: "en-US",
          value: "1280 Main St W, Hamilton, ON L8S 4L8, Canada",
        },
      },
    },
    dateTime: {
      doorsOpen: "2026-01-11T13:00:00Z",
      start: "2026-01-11T13:00:00Z",
      end: "2026-01-13T23:00:00Z",
    },
    locations: [
      {
        latitude: 43.2638001,
        longitude: 79.9217917,
      },
    ],
  };
}

function createObject(issuerId: string, userId: string, classId: string) {
  return {
    id: `${issuerId}.${userId}`,
    classId: `${issuerId}.${classId}`,
    state: "ACTIVE",
    heroImage: {
      sourceUri: {
        uri: "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg",
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "Hero image description",
        },
      },
    },
    textModulesData: [
      {
        header: "Text module header",
        body: "Text module body",
        id: "TEXT_MODULE_ID",
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: "http://maps.google.com/",
          description: "Link module URI description",
          id: "LINK_MODULE_URI_ID",
        },
        {
          uri: "tel:6505555555",
          description: "Link module tel description",
          id: "LINK_MODULE_TEL_ID",
        },
      ],
    },
    imageModulesData: [
      {
        mainImage: {
          sourceUri: {
            uri: "http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg",
          },
          contentDescription: {
            defaultValue: {
              language: "en-US",
              value: "Image module description",
            },
          },
        },
        id: "IMAGE_MODULE_ID",
      },
    ],
    barcode: {
      type: "QR_CODE",
      value: "QR code",
    },
    locations: [
      {
        latitude: 37.424015499999996,
        longitude: -122.09259560000001,
      },
    ],
    seatInfo: {
      seat: {
        defaultValue: {
          language: "en-US",
          value: "42",
        },
      },
      row: {
        defaultValue: {
          language: "en-US",
          value: "G3",
        },
      },
      section: {
        defaultValue: {
          language: "en-US",
          value: "5",
        },
      },
      gate: {
        defaultValue: {
          language: "en-US",
          value: "A",
        },
      },
    },
    ticketHolderName: "Ticket holder name",
    ticketNumber: "Ticket number",
  };
}
