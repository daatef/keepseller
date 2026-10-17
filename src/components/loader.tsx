"use client";

import React from "react";
import './loader.css';

export default function Loader() {
  return (
    <div className="loader loader-bg-color">
      <div className="wrapper">
        <div className="row cf">
          <div className="span">
            <div className="circle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
