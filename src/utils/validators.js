/**
 * اعتبارسنجی ایمیل
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "ایمیل الزامی است";
  if (!emailRegex.test(email)) return "ایمیل معتبر نیست";
  return null;
};

/**
 * اعتبارسنجی رمز عبور
 */
export const validatePassword = (password) => {
  if (!password) return "رمز عبور الزامی است";
  if (password.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد";
  if (!/[A-Z]/.test(password))
    return "رمز عبور باید حداقل یک حرف بزرگ داشته باشد";
  if (!/[a-z]/.test(password))
    return "رمز عبور باید حداقل یک حرف کوچک داشته باشد";
  if (!/[0-9]/.test(password)) return "رمز عبور باید حداقل یک عدد داشته باشد";
  return null;
};

/**
 * اعتبارسنجی تایید رمز عبور
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "تکرار رمز عبور الزامی است";
  if (password !== confirmPassword) return "رمز عبور و تکرار آن مطابقت ندارند";
  return null;
};

/**
 * اعتبارسنجی نام
 */
export const validateName = (name) => {
  if (!name) return "نام الزامی است";
  if (name.length < 2) return "نام باید حداقل ۲ کاراکتر باشد";
  if (name.length > 50) return "نام نباید بیشتر از ۵۰ کاراکتر باشد";
  return null;
};

/**
 * اعتبارسنجی شماره موبایل ایران
 */
export const validatePhone = (phone) => {
  if (!phone) return null;
  const phoneRegex = /^09[0-9]{9}$/;
  if (!phoneRegex.test(phone)) return "شماره موبایل معتبر نیست";
  return null;
};
