import { PKPass } from "passkit-generator";
import { promises as fs } from "fs";
import { env } from "../../../../../env/server.mjs";
import path from "path";

import { prisma } from "../../../../../server/db/client";

// // import { db } from "@/server/db";
// import path from "path";
// import { env } from "../../../../../env/server.mjs";
// // async function readFileToBuffer(filePath: string): Promise<Buffer> {
// //   try {
// //     const buffer = await fs.readFile(filePath);
// //     console.log("File buffer:", buffer);
// //     return buffer;
// //   } catch (err) {
// //     console.error("Error reading file:", err);
// //     throw err;
// //   }
// // }

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;

  const user = await prisma?.user.findFirst({
    where: {
      id: id,
    },
    include: {
      DH11Application: true,
    },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const cardColor = "rgb(94, 51, 184)";

  try {
    /** Each, but last, can be either a string or a Buffer. See API Documentation for more */

    const wwdr = (await prisma.config.findFirst({
      where: {
        name: "APPLE_WWDR",
      },
    }))!.value;

    const signerCert = (await prisma.config.findFirst({
      where: {
        name: "APPLE_SIGNER_CERT",
      },
    }))!.value;

    const signerKey = (await prisma.config.findFirst({
      where: {
        name: "APPLE_SIGNER_KEY",
      },
    }))!.value;

    const signerKeyPassphrase = (await prisma.config.findFirst({
      where: {
        name: "APPLE_SIGNER_KEY_PASSPHRASE",
      },
    }))!.value;
    const pass = await PKPass.from(
      {
        /**
         * Note: .pass extension is enforced when reading a
         * model from FS, even if not specified here below
         */
        model: path.resolve("src/assets/deltahacks_11.pass"),
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase,
        },
      },
      {
        backgroundColor: cardColor,
      },
    );

    // Adding some settings to be written inside pass.json
    // pass.localize("en", { ... });
    pass.setBarcodes(`${env.NEXT_PUBLIC_URL}/profile/${id}`); // Random value
    // pass.primaryFields.push({ key: "header", value: "" });

    pass.backFields.push({
      key: "ticket-buyer-name",
      label: "For",
      value: `${user.DH11Application?.firstName} ${user.DH11Application?.lastName}`,
    });

    pass.primaryFields.push({
      key: "ticket-for",
      label: "Ticket for",
      value: `${user.DH11Application?.firstName} ${user.DH11Application?.lastName}                                  `,
    });

    // add a background color

    // Generate the stream .pkpass file stream
    const dataBuffer = pass.getAsBuffer();
    return new Response(dataBuffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": "attachment; filename=pass.pkpass",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Something went wrong", { status: 500 });
  }
};
