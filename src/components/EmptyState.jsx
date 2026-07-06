import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

function EmptyState({
  icon: Icon = Inbox,
  title = "محتوایی یافت نشد",
  description = "هنوز چیزی اینجا وجود ندارد",
  action = null,
  className = "",
}) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mb-6">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
