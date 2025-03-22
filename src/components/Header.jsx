import { User } from "lucide-react";

function Header({ name, date, points }) {
  return (
    <div className="header">
      <div className="user-info">
        <div className="avatar">
          <User size={24} color="#8e8e93" />
        </div>
        <div className="user-details">
          <div className="user-name">{name}</div>
          <div className="user-date">{date}</div>
        </div>
      </div>
      <div className="points-container">
        <div className="points">Points</div>
        <div>{points}</div>
      </div>
    </div>
  );
}

export default Header;
