"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Home() {
  const [stepSize, setStepSize] = useState(5); // Default step size
  const [position, setPosition] = useState(90); // Default target position
  const [delay, setDelay] = useState(500); // Default delay in ms
  const [message, setMessage] = useState("");
  const [eventLog, setEventLog] = useState<string[]>([]); // Stores event logs

  useEffect(() => {
    // Enable Pusher logging in development mode
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }

    // Initialize Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });

    const channel = pusher.subscribe("exo-channel"); // Listening on this channel
    channel.bind("servo-update", (data: any) => {
      console.log("📥 Received event:", data);
      setMessage(`Step: ${data.stepSize}, Position: ${data.position}, Delay: ${data.delay}`);
      setEventLog((prevLog) => [`🟢 Step: ${data.stepSize}, Position: ${data.position}, Delay: ${data.delay}`, ...prevLog]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  async function sendServoCommand() {
    try {
      const response = await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "exo-channel",
          event: "servo-update",
          stepSize,
          position,
          delay,
        }),
      });

      const result = await response.json(); // Get response data
      console.log("🔹 API Response:", result);

      if (response.ok) {
        console.log(`✅ Sent command: Step=${stepSize}, Position=${position}, Delay=${delay}`);
      } else {
        console.error("❌ Failed to send command:", result.error);
      }
    } catch (error) {
      console.error("❌ API request failed:", error);
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Remote Exoskeleton Control Panel</h1>

      <div className="mt-4">
        <label className="block">Step Size:</label>
        <input
          type="number"
          value={stepSize}
          onChange={(e) => setStepSize(parseInt(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div className="mt-4">
        <label className="block">Target Position:</label>
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div className="mt-4">
        <label className="block">Time Delay (ms):</label>
        <input
          type="number"
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <button
        onClick={sendServoCommand}
        className="bg-blue-500 text-white px-4 py-2 mt-4"
      >
        Send Servo Command
      </button>

      <h2 className="text-lg font-semibold mt-6">Live Event Log:</h2>
      <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-100 h-40 overflow-y-auto text-black">
  {eventLog.length > 0 ? (
    eventLog.map((log, index) => <p key={index} className="text-black">{log}</p>)
  ) : (
    <p className="text-black">No events received yet...</p>
  )}
</div>
    </div>
  );
}
