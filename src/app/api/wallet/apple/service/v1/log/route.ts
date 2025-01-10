// // app/api/example/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the request body

//     const body = await request.json();

//     // Log the received data
//     // console.log("Received data:", body);

//     // Return the received data as response
//     return NextResponse.json(
//       {
//         message: "Data received successfully",
//         data: body,
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     // Handle any errors
//     console.error("Error processing request:", error);
//     return NextResponse.json(
//       {
//         error: "Error processing request",
//       },
//       {
//         status: 400,
//       }
//     );
//   }
// }
