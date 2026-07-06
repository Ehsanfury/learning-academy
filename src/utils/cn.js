/**
 * cn.js
 * Path: src/utils/cn.js
 * Description: Utility for merging class names
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export default cn;
