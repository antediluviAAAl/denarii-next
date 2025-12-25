"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function FadeInImage({
  src,
  alt,
  className,
  style,
  fill,
  width,
  height,
  sizes,
  priority,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt || "Coin Image"}
      className={`${className || ""} ${isLoaded ? "loaded" : ""}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.4s ease-in-out",
      }}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}