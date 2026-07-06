import { motion } from 'framer-motion';
import { BookOpen, Clock, Star, ChevronLeft } from 'lucide-react';
import { useLanguageContext } from '@context/LanguageContext';
import { cn } from '@utils/helpers';

function StoryCard({
  story,
  onClick = null,
  className = '',
}) {
  const { language } = useLanguageContext();

  return (
    <motion.button
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-soft text-right w-full hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      {/* Image/Icon */}
      <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-xl flex items-center justify-center mb-4">
        <span className="text-5xl">{story.image || '📖'}</span>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-1">
        {story.title?.[language] || story.title}
      </h3>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
        {story.description?.[language] || story.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {story.level && (
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full font-medium">
              {story.level}
            </span>
          )}
          {story.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {story.duration} {language === 'fa' ? 'دقیقه' : 'min'}
            </span>
          )}
        </div>

        {story.xp && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary-500">
            <Star className="w-3 h-3" />
            +{story.xp} XP
          </span>
        )}
      </div>

      {/* Progress (if started) */}
      {story.progress > 0 && story.progress < 100 && (
        <div className="mt-3 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${story.progress}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}

export default StoryCard;