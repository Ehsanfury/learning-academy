import { motion } from 'framer-motion';
import { MessageSquare, Clock, Star, CheckCircle } from 'lucide-react';
import { useLanguageContext } from '@context/LanguageContext';
import { cn } from '@utils/helpers';

function ScenarioCard({
  scenario,
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
        'relative bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-soft text-right w-full hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      {/* Completed Badge */}
      {scenario.completed && (
        <div className="absolute top-3 left-3">
          <CheckCircle className="w-5 h-5 text-success-500" />
        </div>
      )}

      {/* Icon */}
      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-xl flex items-center justify-center mb-4">
        <span className="text-2xl">{scenario.icon || '🎭'}</span>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {scenario.title?.[language] || scenario.title}
      </h3>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
        {scenario.description?.[language] || scenario.description}
      </p>

      {/* Key Phrases Preview */}
      {scenario.phrases && scenario.phrases.length > 0 && (
        <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <p className="text-xs text-neutral-500 mb-2">
            {language === 'fa' ? 'عبارات کلیدی:' : 'Key Phrases:'}
          </p>
          <div className="space-y-1">
            {scenario.phrases.slice(0, 2).map((phrase, index) => (
              <p key={index} className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-1">
                {phrase.de || phrase}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {scenario.level && (
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full font-medium">
              {scenario.level}
            </span>
          )}
          {scenario.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scenario.duration} {language === 'fa' ? 'دقیقه' : 'min'}
            </span>
          )}
        </div>

        {scenario.xp && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary-500">
            <Star className="w-3 h-3" />
            +{scenario.xp} XP
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default ScenarioCard;