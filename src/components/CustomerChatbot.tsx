"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, CornerDownLeft } from "lucide-react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface DefaultQuestion {
  id: string;
  q: string;
  a: string;
}

const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    id: "use_freq",
    q: "¿CUÁNTAS VECES AL DÍA PUEDO USAR EL CEPILLO?",
    a: "Puedes usar el cepillo 2 en 1 con pulverizador de agua 1 o 2 veces al día durante tu rutina de peinado o hidratación. Su bruma ultra fina permite rehidratar el cabello sin empaparlo, ideal para aplicar agua, aceites diluidos o tónicos capilares."
  },
  {
    id: "shipping",
    q: "¿CUÁNTO TARDA EN LLEGAR MI PEDIDO?",
    a: "Nuestros envíos son rápidos e incluyen número de seguimiento. El tiempo estimado de entrega en España (Península) es de 24 a 48 horas laborables. Recibirás un enlace por SMS/Email para seguir el paquete."
  },
  {
    id: "oils",
    q: "¿PUEDO MEZCLAR EL AGUA CON ACEITES O TÓNICOS?",
    a: "¡Sí! Puedes añadir agua al depósito del cepillo junto con unas gotas de tu aceite esencial capilar favorito, perfume capilar o tónico de base acuosa. Agítalo ligeramente antes de activar el spray para nutrir tu cabello mientras lo desenredas."
  },
  {
    id: "returns",
    q: "¿HAY GARANTÍA DE DEVOLUCIÓN?",
    a: "Por supuesto. Ofrecemos 14 días de devolución garantizada si el producto no cumple con tus expectativas o tiene algún desperfecto. Tu satisfacción es nuestra prioridad número uno."
  }
];

export default function CustomerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "¡HOLA! SOY EL ASISTENTE VIRTUAL DE VIDA SANTA. ¿EN QUÉ PUEDO AYUDARTE HOY?",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSelectQuestion = (q: DefaultQuestion) => {
    // 1. Add user message
    const newMsg: ChatMessage = {
      sender: "user",
      text: q.q,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    // 2. Add bot answer with simulated delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: q.a,
          timestamp: new Date()
        }
      ]);
    }, 850);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userText = customInput.trim().toUpperCase();
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userText,
        timestamp: new Date()
      }
    ]);
    setCustomInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "HE RECIBIDO TU CONSULTA. UN AGENTE DE VIDA SANTA REVISARÁ TU MENSAJE Y TE CONTESTARÁ POR SMS O EMAIL A LA BREVEDAD. MIENTRAS TANTO, RECUERDA QUE TIENES EL CUPÓN ACTIVO 'VIDASANTA10' CON UN 10% DE DESCUENTO.",
          timestamp: new Date()
        }
      ]);
    }, 1200);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: "bot",
        text: "¡HOLA! SOY EL ASISTENTE VIRTUAL DE VIDA SANTA. ¿EN QUÉ PUEDO AYUDARTE HOY?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="vs-chatbot-wrapper">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button 
          className="vs-chatbot-launcher" 
          onClick={() => setIsOpen(true)}
          aria-label="Abrir asistente de soporte"
        >
          <div className="vs-chatbot-pulse-dot" />
          <MessageSquare size={16} color="#ffffff" strokeWidth={2} />
          <span className="vs-chatbot-launcher-text">SOPORTE ONLINE</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="vs-chatbot-window">
          {/* Header */}
          <div className="vs-chatbot-header">
            <div className="vs-chatbot-header-info">
              <span className="vs-chatbot-header-brand">VIDA SANTA</span>
              <span className="vs-chatbot-header-status">
                <span className="vs-chatbot-status-dot" />
                ASISTENTE VIRTUAL
              </span>
            </div>
            <button 
              className="vs-chatbot-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="vs-chatbot-body">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`vs-chat-bubble-container ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}
              >
                <span className="vs-chat-bubble-sender">
                  {msg.sender === "user" ? "TÚ" : "VIDA SANTA"}
                </span>
                <div className="vs-chat-bubble">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="vs-chat-bubble-container bot-msg">
                <span className="vs-chat-bubble-sender">VIDA SANTA</span>
                <div className="vs-chat-bubble vs-chat-typing">
                  <span className="vs-typing-dot" />
                  <span className="vs-typing-dot" />
                  <span className="vs-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Selection / Reset Options */}
          <div className="vs-chatbot-options">
            <span className="vs-chatbot-options-label">PREGUNTAS FRECUENTES:</span>
            <div className="vs-chatbot-questions-grid">
              {DEFAULT_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className="vs-chatbot-q-btn"
                >
                  {q.q}
                </button>
              ))}
            </div>
            {messages.length > 2 && (
              <button onClick={handleReset} className="vs-chatbot-reset-btn">
                VOLVER AL INICIO
              </button>
            )}
          </div>

          {/* Custom Message Form */}
          <form className="vs-chatbot-footer" onSubmit={handleSendCustom}>
            <input
              type="text"
              placeholder="ESCRIBE TU DUDA..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="vs-chatbot-input"
            />
            <button type="submit" className="vs-chatbot-send-btn" aria-label="Enviar">
              <Send size={12} strokeWidth={2} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .vs-chatbot-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          font-family: var(--font-jost), sans-serif;
        }

        /* Launcher Trigger */
        .vs-chatbot-launcher {
          background: #000000;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 14px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 0 !important; /* Strictly Rectangular */
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transition: background 0.3s, transform 0.2s;
        }
        .vs-chatbot-launcher:hover {
          background: #111111;
          transform: translateY(-2px);
        }
        .vs-chatbot-launcher-text {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .vs-chatbot-pulse-dot {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          display: inline-block;
          animation: chatbot-pulse 1.8s infinite ease-in-out;
          border-radius: 0 !important; /* Strictly Rectangular */
        }

        /* Chat Window */
        .vs-chatbot-window {
          width: 360px;
          height: 520px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          border-radius: 0 !important; /* Strictly Rectangular */
          animation: vs-bot-open 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Header */
        .vs-chatbot-header {
          background: #000000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vs-chatbot-header-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .vs-chatbot-header-brand {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #ffffff;
        }
        .vs-chatbot-header-status {
          font-size: 8.5px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.55);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .vs-chatbot-status-dot {
          width: 5px;
          height: 5px;
          background: #10b981;
          display: inline-block;
          border-radius: 0 !important;
        }
        .vs-chatbot-close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .vs-chatbot-close-btn:hover {
          color: #ffffff;
        }

        /* Chat Body Messages */
        .vs-chatbot-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #050505;
        }
        .vs-chat-bubble-container {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          gap: 4px;
        }
        .vs-chat-bubble-container.user-msg {
          align-self: flex-end;
          align-items: flex-end;
        }
        .vs-chat-bubble-container.bot-msg {
          align-self: flex-start;
          align-items: flex-start;
        }
        .vs-chat-bubble-sender {
          font-size: 7.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }
        .vs-chat-bubble {
          padding: 10px 14px;
          font-size: 9.5px;
          line-height: 1.5;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 0 !important;
        }
        .user-msg .vs-chat-bubble {
          background: #ffffff;
          color: #000000;
        }
        .bot-msg .vs-chat-bubble {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Typing indicators */
        .vs-chat-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 12px 16px;
        }
        .vs-typing-dot {
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          display: inline-block;
          animation: vs-typing-bounce 1.4s infinite ease-in-out both;
          border-radius: 0 !important;
        }
        .vs-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .vs-typing-dot:nth-child(2) { animation-delay: -0.16s; }

        /* Options grid selection */
        .vs-chatbot-options {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #000000;
        }
        .vs-chatbot-options-label {
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.45);
        }
        .vs-chatbot-questions-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 100px;
          overflow-y: auto;
        }
        .vs-chatbot-q-btn {
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px;
          font-size: 8.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          border-radius: 0 !important;
          text-transform: uppercase;
        }
        .vs-chatbot-q-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .vs-chatbot-reset-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-decoration: underline;
          cursor: pointer;
          align-self: center;
          margin-top: 4px;
        }
        .vs-chatbot-reset-btn:hover {
          color: #ffffff;
        }

        /* Footer Input Form */
        .vs-chatbot-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #000000;
        }
        .vs-chatbot-input {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 9.5px;
          color: #ffffff;
          outline: none;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .vs-chatbot-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .vs-chatbot-send-btn {
          background: #ffffff;
          color: #000000;
          border: none;
          padding: 8px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 !important;
          transition: opacity 0.2s;
        }
        .vs-chatbot-send-btn:hover {
          opacity: 0.85;
        }

        /* Animations */
        @keyframes chatbot-pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        @keyframes vs-typing-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        @keyframes vs-bot-open {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Mobile specific spacing layout override */
        @media (max-width: 767px) {
          .vs-chatbot-wrapper {
            bottom: 16px;
            right: 16px;
          }
          .vs-chatbot-window {
            width: calc(100vw - 32px);
            height: 480px;
          }
        }
      `}</style>
    </div>
  );
}
