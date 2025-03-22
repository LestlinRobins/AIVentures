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

  const initialPrompt = `You are a delivery planning assistant. ONLY collect the following information through questions:
  - Start location (REQUIRED)
  - End location (REQUIRED)
  - Number of packages (REQUIRED)
  - Weight per package (use "1kg" if not asked)
  - Volume per package (use "0.1m³" if not asked)
  - Priority level (use "standard" if not asked)

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
       "priorityLevel": "standard"
     }
     ✅ The best route has been calculated and scheduled for your delivery. Your packages will be picked up from [start_location] and delivered to [end_location] via the most optimal route.

  CRITICAL RULES:
  - Focus ONLY on collecting start location, end location, and number of packages
  - Use default values for weight, volume, and priority
  - NEVER ask more than 3 questions
  - NEVER provide additional information or suggestions
  - NEVER continue conversation after showing JSON and success message`;

  const processUserInput = async (input) => {
    try {
      setIsProcessing(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Force output JSON after 3 questions
      const forceJsonOutput = questionCount >= 3;

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

          const successMessage = text
            .split(jsonMatch[0])[1]
            .trim()
            .match(/✅.*via the most optimal route\./);

          const formattedResponse = `${JSON.stringify(
            extractedData,
            null,
            2
          )}\n\n${successMessage ? successMessage[0] : ""}`;

          setConversation((prev) => [
            ...prev,
            { role: "user", content: input },
            { role: "assistant", content: formattedResponse },
          ]);

          // Disable further input after JSON is displayed
          setIsProcessing(true);
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
          // Force JSON output with default values
          const defaultData = {
            startLocation: "unknown",
            endLocation: "unknown",
            numberOfPackages: 1,
            weightPerPackage: "1kg",
            volumePerPackage: "0.1m³",
            priorityLevel: "standard",
          };

          setDeliveryData(defaultData);
          onDataReady(defaultData);

          const formattedResponse = `${JSON.stringify(
            defaultData,
            null,
            2
          )}\n\n✅ The best route has been calculated and scheduled for your delivery. Your packages will be picked up from ${
            defaultData.startLocation
          } and delivered to ${
            defaultData.endLocation
          } via the most optimal route.`;

          setConversation((prev) => [
            ...prev,
            { role: "user", content: input },
            { role: "assistant", content: formattedResponse },
          ]);

          setIsProcessing(true);
        }
      }
    } catch (error) {
      console.error("Error processing input:", error);
    } finally {
      if (!deliveryData) {
        setIsProcessing(false);
        setUserInput("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    processUserInput(userInput);
  };

  const renderDeliveryTable = () => {
    if (!deliveryData) return null;

    return (
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

      {renderDeliveryTable()}

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
    </div>
  );
};

export default AIInput;
