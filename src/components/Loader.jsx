import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";

function Loader({ fullScreen = false, text = null, size = "md" }) {
  const { language } = useLanguageContext();

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500" />
      </motion.div>

      {text && (
        <motion.p
          className="text-sm text-neutral-500 dark:text-neutral-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {spinnerContent}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {spinnerContent}
    </motion.div>
  );
}

export default Loader;
