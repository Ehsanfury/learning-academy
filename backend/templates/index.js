/**
 * index.js
 * Path: backend/templates/index.js
 * Description: Export all email templates
 * Version: 2.0 - Fixed exports
 */

import verificationEmail from "./verificationEmail.js";
import resetPasswordEmail from "./resetPasswordEmail.js";
import {
  welcomeEmail,
  baseLayout,
  button,
  text,
  alert,
  code,
  divider,
  BRAND,
} from "./emailTemplates.js";

export {
  verificationEmail,
  resetPasswordEmail,
  welcomeEmail,
  baseLayout,
  button,
  text,
  alert,
  code,
  divider,
  BRAND,
};

export default {
  verificationEmail,
  resetPasswordEmail,
  welcomeEmail,
  baseLayout,
  button,
  text,
  alert,
  code,
  divider,
  BRAND,
};
