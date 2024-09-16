import React from "react";

function Path({ path }) {
  return (
    <div className="Path">
      <span>root</span>
      {path.map((folder, index) => (
        <React.Fragment key={index}>
          <span>/</span>
          <span>{folder}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Path;
