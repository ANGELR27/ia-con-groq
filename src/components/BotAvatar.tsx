import React from "react";
import "../styles/bot-avatar.css";

interface BotAvatarProps {
  isTyping?: boolean;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({ isTyping = false }) => {
  return (
    <div className={`bot-avatar ${isTyping ? "typing" : ""}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="bot-avatar-svg"
      >
        <path
          d="M200 50C270 50 300 80 300 150C300 220 270 250 200 250C130 250 100 220 100 150C100 80 130 50 200 50Z"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="bot-avatar-path"
        />
        <path
          d="M200 250V350"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="bot-avatar-path"
        />
      </svg>
    </div>
  );
};
