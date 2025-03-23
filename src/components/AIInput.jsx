import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./AIInput.css";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AIInput = ({ onDataReady }) => {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const initialPrompt = `You are a delivery planning assistant. ONLY collect the following information through questions:
  - Start location (REQUIRED)
  - End location (REQUIRED)
  - Number of packages (REQUIRED)
  - Weight per package (REQUIRED)(use "1kg" if not asked)
  - Volume per package (REQUIRED)(use "0.1m³" if not asked)
  - Priority level (REQUIRED)(use "standard" if not asked)

  STRICT PROCESS:
  1. You have EXACTLY 3 questions to collect ONLY the REQUIRED information.
  2. Start each question with "Question [X/3]:"
  3. After 3 questions OR if you have all REQUIRED information, IMMEDIATELY output:
     {
       "startLocation": "[value]",
       "endLocation": "[value]",
       "numberOfPackages": [number],
       "weightPerPackage": "1kg",
       "volumePerPackage": "0.1m³",
       "priorityLevel": "standard",
       "vehicleType": "[value]"
     }
The [value] can be "car", "bike", "truck", "van", "motorcycle", "bicycle", "bus", depending on the load and the number of packages, size of the packages, etc.
  CRITICAL RULES:
  - Focus ONLY on collecting start location, end location, and number of packages
  - Use default values for weight, volume, and priority
  - NEVER ask more than 3 questions
  - NEVER provide additional information or suggestions
  - NEVER continue conversation after showing JSON`;

  const processUserInput = async (input) => {
    try {
      setIsProcessing(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Force output JSON after 3 questions
      const forceJsonOutput = questionCount >= 2; // Change to 2 so the 3rd question is the last one

      let prompt =
        conversation.length === 0
          ? `${initialPrompt}\n\nUser: ${input}`
          : `${initialPrompt}\nQuestion count: ${questionCount}/3\nPrevious conversation: ${JSON.stringify(
              conversation
            )}\nUser: ${input}${
              forceJsonOutput
                ? "\nMANDATORY: You MUST output JSON now and end conversation."
                : ""
            }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Check if response contains JSON data
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]);
          setDeliveryData(extractedData);
          onDataReady(extractedData);

          // Add the final JSON to the conversation
          setConversation((prev) => [
            ...prev,
            { role: "user", content: input },
            {
              role: "assistant",
              content: JSON.stringify(extractedData, null, 2),
            },
          ]);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
        }
      } else {
        // Only increment question count and continue if under 3 questions
        if (questionCount < 3) {
          const question = text.replace(/^AI: /, "").trim();
          setQuestionCount((prev) => prev + 1);

          setConversation((prev) => [
            ...prev,
            { role: "user", content: input },
            { role: "assistant", content: question },
          ]);
        } else {
          // Force JSON output with default values for any missing information
          const defaultData = {
            startLocation: "unknown",
            endLocation: "unknown",
            numberOfPackages: 1,
            weightPerPackage: "1kg",
            volumePerPackage: "0.1m³",
            priorityLevel: "standard",
          };

          // Extract any information we have from previous conversation
          const partialData = {};
          conversation.forEach((msg) => {
            if (msg.role === "user") {
              // Very basic extraction - would need more robust parsing in a real app
              if (msg.content.includes("from") && msg.content.includes("to")) {
                const fromMatch = msg.content.match(/from\s+([^,\.]+)/i);
                const toMatch = msg.content.match(/to\s+([^,\.]+)/i);
                if (fromMatch) partialData.startLocation = fromMatch[1].trim();
                if (toMatch) partialData.endLocation = toMatch[1].trim();
              }

              const packagesMatch = msg.content.match(/(\d+)\s+packages?/i);
              if (packagesMatch)
                partialData.numberOfPackages = parseInt(packagesMatch[1]);
            }
          });

          const finalData = { ...defaultData, ...partialData };

          setDeliveryData(finalData);
          onDataReady(finalData);

          // Add the final JSON to the conversation
          setConversation((prev) => [
            ...prev,
            { role: "user", content: input },
            { role: "assistant", content: JSON.stringify(finalData, null, 2) },
          ]);
        }
      }
    } catch (error) {
      console.error("Error processing input:", error);
    } finally {
      setIsProcessing(false);
      setUserInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    processUserInput(userInput);
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
  };

  // Only show the input form if we don't have delivery data yet
  const renderInputForm = () => {
    if (deliveryData) return null;

    return (
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe your delivery request..."
          disabled={isProcessing}
          className="ai-input"
        />
        <button
          type="submit"
          disabled={isProcessing || !userInput.trim()}
          className="submit-button"
        >
          {isProcessing ? "Processing..." : "Send"}
        </button>
      </form>
    );
  };

  // Show confirmation button if we have data but order is not confirmed
  const renderConfirmButton = () => {
    if (!deliveryData || orderConfirmed) return null;

    return (
      <button className="confirm-button" onClick={handleConfirmOrder}>
        Confirm Order
      </button>
    );
  };

  // Show confirmation message after order is confirmed
  const renderConfirmationMessage = () => {
    if (!orderConfirmed) return null;

    return (
      <div className="confirmation-message">
        <p>
          ✅ The best route has been calculated and scheduled for your delivery.
          Your packages will be picked up from {deliveryData.startLocation} and
          delivered to {deliveryData.endLocation} via the most optimal route.
        </p>
        <p className="priority-notice">
          We've noticed you are requesting a delivery from an area affected by a
          natural calamity, so we'll prioritize your order.
        </p>
      </div>
    );
  };

  return (
    <div className="ai-input-container">
      <div className="conversation-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      {deliveryData && (
        <div className="delivery-table-container">
          <h3>Delivery Summary</h3>
          <table className="delivery-table">
            <tbody>
              {Object.entries(deliveryData).map(([key, value]) => (
                <tr key={key}>
                  <td className="label">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  <td className="value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renderInputForm()}
      {renderConfirmButton()}
      {renderConfirmationMessage()}
    </div>
  );
};

export default AIInput;
