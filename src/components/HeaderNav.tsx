import React from "react";
import { Link } from "react-router-dom";

const HeaderNav: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <Link to="/" className="text-white hover:underline px-2">Home</Link>
      <Link to="/calendar" className="text-white hover:underline px-2">Calendar</Link>
      <Link to="/login" className="text-white hover:underline px-2">Login</Link>
    </nav>
  );
};

export default HeaderNav;
