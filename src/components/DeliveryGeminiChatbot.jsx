import React, { useState, useRef, useEffect } from 'react';

const DeliveryGeminiChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your delivery assistant powered by Gemini. How can I help you today?",
      sender: "bot"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // You would store your Gemini API key securely, typically in environment variables
  const GEMINI_API_KEY = import.meta.VITE_GEMINI_API_KEY;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const generateGeminiPrompt = (query, conversationHistory) => {
    // Create a structured prompt for Gemini to understand the context and purpose
    return `
You are an AI assistant for a delivery optimization app with the following innovative features:
- Route optimization using real-time traffic data, weather conditions, and road conditions
- Precise delivery time prediction using historical data and AI analysis
- Priority delivery for hospitals and elderly customers
- AI-based vehicle selection based on efficiency, route conditions, and package details
- Reliable delivery with driver transfer capability in case of issues
- Real-time updates and tracking

User's recent conversation: 
${conversationHistory.map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`).join('\n')}

User's current question: ${query}

Please provide a helpful, friendly, and informative response focused on delivery services.
`;
  };

  const processQueryWithGemini = async (query) => {
    try {
      setLoading(true);
      
      // Get recent conversation history (last 5 messages) for context
      const recentHistory = messages.slice(-5);
      
      // Create the prompt for Gemini
      const prompt = generateGeminiPrompt(query, recentHistory);
      
      // This is where you'd make the actual API call to Gemini
      // For now, we'll simulate the API call with a timeout and pre-defined responses
      
      // Example of how the Gemini API call would look:
      /*
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      */
      
      // Simulated response for demonstration
      return new Promise((resolve) => {
        setTimeout(() => {
          let aiResponse = "";
          const lowerQuery = query.toLowerCase();
          
          if (lowerQuery.includes('track') || lowerQuery.includes('where') || lowerQuery.includes('status') || lowerQuery.includes('update')) {
            aiResponse = "To check your delivery status, I need your order number. Could you provide that for me? With Gemini's advanced tracking, I can give you precise location and ETA information.";
          } else if (lowerQuery.includes('route') || lowerQuery.includes('traffic') || lowerQuery.includes('delay')) {
            aiResponse = "Our Gemini-powered system optimizes routes in real-time, analyzing traffic patterns, weather forecasts, and road conditions. Routes are refreshed every 10-15 minutes, and our AI can predict potential delays before they happen!";
          } else if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('storm')) {
            aiResponse = "Gemini helps us monitor weather patterns with remarkable accuracy. We analyze current conditions and forecasts to adjust delivery routes proactively, keeping your packages on schedule despite weather events.";
          } else if (lowerQuery.includes('priority') || lowerQuery.includes('urgent') || lowerQuery.includes('emergency')) {
            aiResponse = "Our priority system uses Gemini's contextual understanding to automatically identify and expedite critical deliveries to hospitals and elderly customers. For urgent deliveries, we can adjust priorities in real-time across our entire fleet.";
          } else if (lowerQuery.includes('vehicle') || lowerQuery.includes('transport')) {
            aiResponse = "Gemini analyzes multiple factors to select the optimal vehicle for each delivery - package dimensions, weight, route conditions, fuel efficiency, and even carbon footprint. This maximizes efficiency while minimizing environmental impact.";
          } else if (lowerQuery.includes('driver') || lowerQuery.includes('breakdown') || lowerQuery.includes('accident')) {
            aiResponse = "If a delivery is at risk due to vehicle issues or traffic incidents, Gemini instantly recalculates and can transfer the package to another nearby driver without disrupting their existing route optimization.";
          } else if (lowerQuery.includes('thank')) {
            aiResponse = "You're welcome! I'm happy to help with any other questions about our delivery services. Gemini helps me understand your needs better to provide the most relevant information.";
          } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            aiResponse = "Hello! I'm your Gemini-powered delivery assistant. How can I help optimize your delivery experience today?";
          } else if (lowerQuery.includes('time') || lowerQuery.includes('eta') || lowerQuery.includes('when')) {
            aiResponse = "Gemini's predictive algorithms analyze historical delivery data for each specific location, accounting for factors like building access, security wait times, elevator usage, and even time of day patterns to provide remarkably accurate delivery windows.";
          } else if (lowerQuery.includes('how') && lowerQuery.includes('work')) {
            aiResponse = "Our system leverages Gemini's advanced AI to optimize every aspect of delivery. It processes real-time data from multiple sources, predicts potential issues, and makes smart decisions about routing, vehicle selection, and scheduling - all to ensure your packages arrive on time and efficiently.";
          } else {
            aiResponse = "I understand you're asking about " + query + ". As your Gemini-powered delivery assistant, I'm continuously learning to better assist with all delivery-related questions. Could you provide more details about what specific information you need?";
          }
          
          resolve(aiResponse);
        }, 1500);
      });
      
    } catch (error) {
      console.error("Error with Gemini API:", error);
      return "I'm having trouble connecting to my AI services right now. Please try again in a moment.";
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      // Get response from Gemini
      const response = await processQueryWithGemini(inputValue);
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        sender: "bot"
      }]);
    } catch (error) {
      // Handle errors
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChatbot}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chatbot interface */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="font-medium">Delivery Assistant (Gemini)</h3>
            </div>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div 
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask about your delivery..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                type="submit"
                disabled={inputValue.trim() === '' || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DeliveryGeminiChatbot;