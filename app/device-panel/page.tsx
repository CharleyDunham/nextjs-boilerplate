"use client";

import { useEffect, useState } from "react";

export default function DevicePanel() {
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const [servoEnabled, setServoEnabled] = useState(false);
  const [servoStreamEnabled, setServoStreamEnabled] = useState(false);
  const [servoPin, setServoPin] = useState("D0");
  const [angleStep, setAngleStep] = useState(10);
  const [timeDelay, setTimeDelay] = useState(500);
  const [maxRange, setMaxRange] = useState(180);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://${window.location.hostname}:81`);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConsoleLog((prev) => ["🟢 Connected to WebSocket", ...prev]);
    };

    socket.onmessage = (event) => {
      console.log("📥 Received:", event.data);
      setConsoleLog((prev) => [`📥 ${event.data}`, ...prev]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConsoleLog((prev) => ["🔴 WebSocket Disconnected", ...prev]);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  function sendCommand(command: string, value: any) {
    if (ws) {
      const msg = JSON.stringify({ command, value });
      ws.send(msg);
      setConsoleLog((prev) => [`➡️ Sent: ${msg}`, ...prev]);
    } else {
      console.error("❌ WebSocket not connected");
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Device Panel</h1>

      {/* Console Log */}
      <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-100 h-40 overflow-y-auto text-black">
        <h2 className="text-lg font-semibold">Console Log</h2>
        {consoleLog.map((log, index) => (
          <p key={index} className="text-black">{log}</p>
        ))}
      </div>

      {/* Servo Settings */}
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
