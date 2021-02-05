/**
 * SkoshX (https://skoshx.com)
 * Header component
 */

import { h } from "preact";

import logo from "../public/images/icons/droplet.svg";

export const Header = () => {
  const logoStyle = {
    fontSize: "20px",
  };
  return (
    <header>
      <div className="logo">
        <a href="/">
          <img src={logo} alt="Logo" style={{ marginBottom: "-10px" }} />
        </a>
      </div>
    </header>
  );
};
