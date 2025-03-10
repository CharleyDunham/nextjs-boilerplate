import { NextApiRequest, NextApiResponse } from "next";
import Pusher from "pusher";

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "",
  useTLS: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { channel, event, stepSize, position, delay } = req.body;

  // Validate Inputs
  if (typeof stepSize !== "number" || typeof position !== "number" || typeof delay !== "number") {
    return res.status(400).json({ error: "Invalid input. Step size, position, and delay must be numbers." });
  }

  console.log(`🔹 Sending event:
    Channel: ${channel}
    Event: ${event}
    Step Size: ${stepSize}
    Position: ${position}
    Delay: ${delay}
  `);

  try {
    const response = await pusher.trigger(channel, event, { stepSize, position, delay });
    console.log("✅ Pusher event sent successfully:", response);
    return res.status(200).json({ success: true, message: "Event sent", stepSize, position, delay });
  } catch (error) {
    console.error("❌ Pusher event failed:", error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
}
