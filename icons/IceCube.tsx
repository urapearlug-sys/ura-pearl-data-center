"use client";

import React from "react";
import Image from "next/image";
import { IconProps } from "../utils/types";
import { iceToken } from "@/images";

/**
 * ALM/cube icon used across the app (loading, game, earn, etc.).
 * To use your own image: replace images/ice-token.png with your ALM icon
 * (square PNG works best, e.g. 512x512).
 */
const IceCube: React.FC<IconProps> = ({ size = 24, className = "" }) => {
  return (
    <Image
      src={iceToken}
      alt="ALM"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
};

export default IceCube;
