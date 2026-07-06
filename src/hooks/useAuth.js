import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@context/AuthContext";
import toast from "react-hot-toast";

function useAuth() {
  const auth = useAuthContext();
  const navigate = useNavigate();

  const requireAuth = useCallback(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/login");
      return false;
    }
    return true;
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  const login = useCallback(
    async (email, password) => {
      try {
        const result = await auth.login(email, password);
        toast.success("خوش آمدید!");
        navigate("/dashboard");
        return result;
      } catch (error) {
        toast.error(error.response?.data?.message || "خطا در ورود");
        throw error;
      }
    },
    [auth, navigate],
  );

  const register = useCallback(
    async (userData) => {
      try {
        const result = await auth.register(userData);
        toast.success("حساب کاربری با موفقیت ایجاد شد!");
        navigate("/dashboard");
        return result;
      } catch (error) {
        toast.error(error.response?.data?.message || "خطا در ثبت‌نام");
        throw error;
      }
    },
    [auth, navigate],
  );

  const logout = useCallback(() => {
    auth.logout();
    toast.success("با موفقیت خارج شدید");
    navigate("/");
  }, [auth, navigate]);

  return {
    ...auth,
    requireAuth,
    login,
    register,
    logout,
  };
}

export default useAuth;
