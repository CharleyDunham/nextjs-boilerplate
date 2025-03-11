"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function DevicePanel() {
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const [servoEnabled, setServoEnabled] = useState(false);
  const [servoStreamEnabled, setServoStreamEnabled] = useState(false);
  const [servoPin, setServoPin] = useState("D0");
  const [angleStep, setAngleStep] = useState(10);
  const [timeDelay, setTimeDelay] = useState(500);
  const [maxRange, setMaxRange] = useState(180);

  useEffect(() => {
    // Enable Pusher logging in development mode
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }

    // Initialize Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });

    const channel = pusher.subscribe("exo-channel");

    channel.bind("servo-update", (data: any) => {
      console.log("📥 Received event:", data);
      setConsoleLog((prevLog) => [`📥 ${JSON.stringify(data)}`, ...prevLog]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  async function sendCommand(command: string, value: any) {
    try {
      const response = await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "exo-channel",
          event: command,
          data: value,
        }),
      });

      if (!response.ok) throw new Error("Failed to send event");

      console.log(`✅ Sent command: ${command} = ${value}`);
      setConsoleLog((prev) => [`➡️ Sent: ${command} = ${JSON.stringify(value)}`, ...prev]);
    } catch (error) {
      console.error("❌ API request failed:", error);
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Device Panel (No WebSockets)</h1>

      {/* Console Log */}
      <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-100 h-40 overflow-y-auto text-black">
        <h2 className="text-lg font-semibold">Console Log</h2>
        {consoleLog.map((log, index) => (
          <p key={index} className="text-black">{log}</p>
        ))}
      </div>

      {/* Servo Controls */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Servo Controls</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label>Enable Servo:</label>
            <input
              type="checkbox"
              checked={servoEnabled}
              onChange={(e) => {
                setServoEnabled(e.target.checked);
                sendCommand("enableServo", e.target.checked);
              }}
            />
          </div>

          <div>
            <label>Enable Stream:</label>
            <input
              type="checkbox"
              checked={servoStreamEnabled}
              onChange={(e) => {
                setServoStreamEnabled(e.target.checked);
                sendCommand("enableServoStream", e.target.checked);
              }}
            />
          </div>

          <div>
            <label>Servo Pin:</label>
            <select
              value={servoPin}
              onChange={(e) => {
                setServoPin(e.target.value);
                sendCommand("setServoPin", e.target.value);
              }}
            >
              {Array.from({ length: 14 }, (_, i) => `D${i}`).map((pin) => (
                <option key={pin} value={pin}>
                  {pin}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Angle Step:</label>
            <input
              type="number"
              value={angleStep}
              onChange={(e) => {
                setAngleStep(parseInt(e.target.value));
                sendCommand("setServoAngleStep", parseInt(e.target.value));
              }}
              className="border p-2"
            />
          </div>

          <div>
            <label>Time Delay (ms):</label>
            <input
              type="number"
              value={timeDelay}
              onChange={(e) => {
                setTimeDelay(parseInt(e.target.value));
                sendCommand("setServoTimeDelay", parseInt(e.target.value));
              }}
              className="border p-2"
            />
          </div>

          <div>
            <label>Max Range:</label>
            <input
              type="number"
              value={maxRange}
              onChange={(e) => {
                setMaxRange(parseInt(e.target.value));
                sendCommand("setServoMaxRange", parseInt(e.target.value));
              }}
              className="border p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
