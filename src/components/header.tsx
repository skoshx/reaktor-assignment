/**
 * SkoshX (https://skoshx.com)
 * Header component
 */

import { h } from "preact";

export const Header = () => {
  const logoStyle = {
    fontSize: "20px",
    color: "var(--theme-color)",
    textAlign: "center",
  };
  return (
    <header>
      <div className="logo" style="width: 100%;">
        <a href="/">
          <h5 style={logoStyle}>Reaktor Bad API Assignment</h5>
        </a>
      </div>
    </header>
  );
};
