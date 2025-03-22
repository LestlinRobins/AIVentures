
import React, { useState, useRef, useEffect } from 'react';

const MinimalistDeliveryChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to our delivery assistant. How can I help you today?",
      sender: "bot"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    return `
You are an AI assistant for a delivery optimization app with the following features:
- Route optimization using real-time traffic and weather data
- Precise delivery time prediction using historical data
- Priority delivery for hospitals and elderly customers
- AI-based vehicle selection for optimal efficiency
- Reliable delivery with driver transfer capability
- Real-time updates and tracking

User's recent conversation: 
${conversationHistory.map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`).join('\n')}

User's current question: ${query}

Please provide a professional, concise, and helpful response about our delivery services.
`;
  };

  const processQueryWithGemini = async (query) => {
    try {
      setLoading(true);
      
      // Get recent conversation history for context
      const recentHistory = messages.slice(-5);
      
      // Create the prompt for Gemini
      const prompt = generateGeminiPrompt(query, recentHistory);
      
      // Simulated response for demonstration
      return new Promise((resolve) => {
        setTimeout(() => {
          let aiResponse = "";
          const lowerQuery = query.toLowerCase();
          
          if (lowerQuery.includes('track') || lowerQuery.includes('where') || lowerQuery.includes('status')) {
            aiResponse = "I can provide real-time tracking information. Please share your order number to view the current status and estimated delivery time.";
          } else if (lowerQuery.includes('route') || lowerQuery.includes('traffic')) {
            aiResponse = "Our system automatically optimizes routes using real-time traffic and weather data, refreshing every 10-15 minutes to ensure on-time delivery.";
          } else if (lowerQuery.includes('priority') || lowerQuery.includes('urgent')) {
            aiResponse = "We prioritize deliveries to hospitals and elderly customers automatically. For other urgent deliveries, we can adjust priorities upon request.";
          } else if (lowerQuery.includes('vehicle')) {
            aiResponse = "Our AI selects the optimal vehicle for each delivery based on package specifications, route conditions, and efficiency factors to minimize costs and environmental impact.";
          } else if (lowerQuery.includes('delay') || lowerQuery.includes('late')) {
            aiResponse = "If a delay occurs, our system immediately recalculates and may transfer the package to another driver to maintain delivery schedules. You'll receive real-time notifications of any changes.";
          } else if (lowerQuery.includes('time') || lowerQuery.includes('eta')) {
            aiResponse = "We provide precise delivery windows by analyzing historical data for each location, including factors like building access time and security procedures.";
          } else if (lowerQuery.includes('feature') || lowerQuery.includes('what') && lowerQuery.includes('do')) {
            aiResponse = "Our delivery service features AI-driven route optimization, precise ETAs, priority handling for critical deliveries, smart vehicle selection, and automatic rerouting to avoid delays.";
          } else {
            aiResponse = "I understand you're asking about " + query + ". To best assist you, could you provide more specific details about your delivery needs?";
          }
          
          resolve(aiResponse);
        }, 1200);
      });
      
    } catch (error) {
      console.error("Error with Gemini API:", error);
      return "I'm having trouble connecting to our AI services right now. Please try again shortly.";
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      const response = await processQueryWithGemini(inputValue);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        sender: "bot"
      }]);
    } catch (error) {
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
        className="bg-gray-800 text-white p-3 rounded-full shadow-md"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Chatbot interface */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 md:w-96 bg-white rounded-md shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium text-sm">Delivery Assistant</h3>
            <button onClick={toggleChatbot} className="text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 h-64">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`px-3 py-2 rounded-md ${
                    message.sender === "user" 
                      ? "bg-gray-800 text-white" 
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white text-gray-800 px-3 py-2 rounded-md border border-gray-200" style={{ maxWidth: '80%' }}>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="bg-white p-2 border-t border-gray-200">
            <div className="flex items-center rounded-md bg-gray-100 px-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your question..."
                className="flex-1 py-2 px-1 bg-transparent border-none focus:outline-none text-sm"
              />
              <button 
                type="submit"
                disabled={inputValue.trim() === '' || loading}
                className={`ml-1 p-1 rounded-md ${inputValue.trim() === '' || loading ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MinimalistDeliveryChatbot;