"use client";

import React from "react";
import Image from "next/image";
import { IconProps } from "../utils/types";
import { iceToken } from "@/images";

/**
 * PEARLS/cube icon (stacked variant) used on game page, top bar, mine, boost, etc.
 * Uses the same image as IceCube. Replace images/ice-token.png with your PEARLS icon
 * to change all cube icons app-wide.
 */
const IceCubes: React.FC<IconProps> = ({ size = 24, className = "" }) => {
  return (
    <Image
      src={iceToken}
      alt="PEARLS"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
};

export default IceCubes;
