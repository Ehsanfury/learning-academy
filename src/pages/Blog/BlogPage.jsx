/**
 * BlogPage.jsx
 * Path: src/pages/Blog/BlogPage.jsx
 * Description: Educational blog with German culture and idioms
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  BookOpen,
  Users,
  Coffee,
  Music,
  Globe,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import Card from "@components/ui/Card";
import Badge from "@components/ui/Badge";
import Button from "@components/ui/Button";

const BlogPage = () => {
  const { language } = useLanguageContext();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: { fa: "همه", en: "All" } },
    { id: "culture", label: { fa: "فرهنگ", en: "Culture" } },
    { id: "idioms", label: { fa: "اصطلاحات", en: "Idioms" } },
    { id: "tips", label: { fa: "نکات", en: "Tips" } },
  ];

  const posts = [
    {
      id: 1,
      category: "culture",
      title: {
        fa: "فرهنگ کافه‌نشینی در آلمان",
        en: "Coffee Shop Culture in Germany",
      },
      excerpt: {
        fa: "آلمانی‌ها چطور قهوه می‌نوشند؟ از 'Feierabend' تا 'Kaffeeklatsch'، فرهنگی که هر زبان‌آموزی باید بداند.",
        en: "How do Germans drink coffee? From 'Feierabend' to 'Kaffeeklatsch', a culture every learner should know.",
      },
      content: {
        fa: "در آلمان، قهوه فقط یک نوشیدنی نیست، یک فرهنگ است. 'Feierabend' به معنای پایان کار روزانه است و بسیاری از آلمانی‌ها این زمان را با یک فنجان قهوه جشن می‌گیرند. 'Kaffeeklatsch' نیز به دورهمی‌های دوستانه با قهوه و کیک اشاره دارد که بخش مهمی از فرهنگ آلمانی است.\n\nنکته جالب: در بسیاری از کافه‌های آلمان، اگر قهوه خود را با خود ببرید (zum Mitnehmen)، قیمت آن کمتر از نوشیدن در کافه (hier trinken) است.",
        en: "In Germany, coffee is more than just a drink, it's a culture. 'Feierabend' means the end of the workday and many Germans celebrate this time with a cup of coffee. 'Kaffeeklatsch' refers to friendly gatherings with coffee and cake, which is an important part of German culture.\n\nInteresting fact: In many German cafés, if you take your coffee to go (zum Mitnehmen), it costs less than drinking it in the café (hier trinken).",
      },
      image: "☕",
      date: "2026-07-01",
      readTime: 5,
      tags: ["فرهنگ", "قهوه", "آلمان"],
    },
    {
      id: 2,
      category: "idioms",
      title: {
        fa: "۱۰ اصطلاح روزمره آلمانی که باید بدانید",
        en: "10 Everyday German Idioms You Should Know",
      },
      excerpt: {
        fa: "از 'Daumen drücken' تا 'Die Kuh vom Eis holen'، اصطلاحاتی که مکالمه شما را طبیعی‌تر می‌کنند.",
        en: "From 'Daumen drücken' to 'Die Kuh vom Eis holen', idioms that make your conversations more natural.",
      },
      content: {
        fa: "۱. 'Daumen drücken' - یعنی شانس آوردن (معادل 'انگشت‌ها را برای کسی نگه داشتن')\n۲. 'Die Kuh vom Eis holen' - یعنی یک مشکل را حل کردن\n۳. 'Tomaten auf den Augen haben' - یعنی چیزی واضح را ندیدن\n۴. 'Nicht alle Tassen im Schrank haben' - یعنی دیوانه بودن (طنزآمیز)\n۵. 'Ich drücke dir die Daumen' - یعنی 'برای تو شانس می‌آورم'",
        en: "1. 'Daumen drücken' - means to wish someone luck (equivalent to 'keeping your fingers crossed')\n2. 'Die Kuh vom Eis holen' - means to solve a problem\n3. 'Tomaten auf den Augen haben' - means not seeing something obvious\n4. 'Nicht alle Tassen im Schrank haben' - means being crazy (humorous)\n5. 'Ich drücke dir die Daumen' - means 'I'm crossing my fingers for you'",
      },
      image: "💬",
      date: "2026-06-25",
      readTime: 8,
      tags: ["اصطلاحات", "مکالمه"],
    },
    {
      id: 3,
      category: "culture",
      title: {
        fa: "آداب معاشرت در آلمان",
        en: "Etiquette in Germany",
      },
      excerpt: {
        fa: "از دست دادن تا تماس چشمی، نکاتی که باید قبل از سفر به آلمان بدانید.",
        en: "From handshakes to eye contact, tips you should know before traveling to Germany.",
      },
      content: {
        fa: "۱. دست دادن: در آلمان، دست دادن محکم و تماس چشمی مستقیم نشانه احترام است.\n۲. پونکتیوالیته: دیر کردن حتی ۵ دقیقه بی‌ادبی محسوب می‌شود.\n۳. 'Sie' vs 'du': همیشه با افراد ناآشنا از 'Sie' استفاده کنید.\n۴. انعام: ۵-۱۰٪ انعام در رستوران‌ها مرسوم است.\n۵. ناهار: وعده اصلی ناهار بین ۱۲ تا ۱۳ است.",
        en: "1. Handshake: In Germany, a firm handshake and direct eye contact are signs of respect.\n2. Punctuality: Being even 5 minutes late is considered rude.\n3. 'Sie' vs 'du': Always use 'Sie' with unfamiliar people.\n4. Tipping: 5-10% tip is customary in restaurants.\n5. Lunch: The main meal is between 12 and 1 PM.",
      },
      image: "🤝",
      date: "2026-06-20",
      readTime: 6,
      tags: ["فرهنگ", "آداب معاشرت"],
    },
    {
      id: 4,
      category: "idioms",
      title: {
        fa: "اصطلاحات غذایی آلمانی",
        en: "German Food Idioms",
      },
      excerpt: {
        fa: "وقتی آلمانی‌ها می‌گویند 'Das ist nicht mein Bier' یعنی چه؟ اصطلاحات غذایی جالب آلمانی.",
        en: "What do Germans mean when they say 'Das ist nicht mein Bier'? Interesting German food idioms.",
      },
      content: {
        fa: "۱. 'Das ist nicht mein Bier' - یعنی 'این مشکل من نیست' (معادل 'این به من ربطی ندارد')\n۲. 'Die Suppe auslöffeln' - یعنی پیامدهای کار خود را پذیرفتن\n۳. 'Salz in die Wunde streuen' - یعنی به درد کسی اضافه کردن\n۴. 'Einen Vogel haben' - یعنی دیوانه بودن\n۵. 'Das ist doch ein dickes Ei' - یعنی این یک مشکل بزرگ است",
        en: "1. 'Das ist nicht mein Bier' - means 'That's not my problem' (equivalent to 'none of my business')\n2. 'Die Suppe auslöffeln' - means to accept the consequences of one's actions\n3. 'Salz in die Wunde streuen' - means to add insult to injury\n4. 'Einen Vogel haben' - means to be crazy\n5. 'Das ist doch ein dickes Ei' - means that's a big problem",
      },
      image: "🍽️",
      date: "2026-06-15",
      readTime: 7,
      tags: ["اصطلاحات", "غذا"],
    },
    {
      id: 5,
      category: "tips",
      title: {
        fa: "۵ نکته برای یادگیری سریع‌تر آلمانی",
        en: "5 Tips for Learning German Faster",
      },
      excerpt: {
        fa: "روش‌های عملی برای تسریع فرآیند یادگیری زبان آلمانی.",
        en: "Practical methods to accelerate your German learning process.",
      },
      content: {
        fa: "۱. هر روز ۱۵ دقیقه گوش دادن به پادکست آلمانی\n۲. تماشای فیلم‌های آلمانی با زیرنویس آلمانی\n۳. استفاده از فلش‌کارت برای لغات جدید\n۴. تمرین مکالمه با هوش مصنوعی\n۵. خواندن داستان‌های کوتاه آلمانی",
        en: "1. Listen to German podcasts for 15 minutes daily\n2. Watch German movies with German subtitles\n3. Use flashcards for new vocabulary\n4. Practice conversation with AI\n5. Read short German stories",
      },
      image: "📚",
      date: "2026-06-10",
      readTime: 4,
      tags: ["نکات", "یادگیری"],
    },
    {
      id: 6,
      category: "culture",
      title: {
        fa: "جشن‌های سنتی آلمان",
        en: "Traditional German Festivals",
      },
      excerpt: {
        fa: "از اکتبرفست تا کارناوال، جشن‌هایی که فرهنگ آلمان را شکل می‌دهند.",
        en: "From Oktoberfest to Carnival, festivals that shape German culture.",
      },
      content: {
        fa: "۱. اکتبرفست (مونیخ): بزرگترین جشن آبجو جهان\n۲. کارناوال (کلن): جشنواره رنگارنگ قبل از روزه\n۳. کریسمس: بازارهای کریسمس با غذاهای سنتی\n۴. شب والپورگیس: جشن باستانی در شب ۳۰ آوریل\n۵. جشنواره راین در آتش: آتش‌بازی تماشایی در رود راین",
        en: "1. Oktoberfest (Munich): The world's largest beer festival\n2. Carnival (Cologne): Colorful pre-Lenten festival\n3. Christmas: Christmas markets with traditional foods\n4. Walpurgis Night: Ancient festival on April 30\n5. Rhine in Flames: Spectacular fireworks on the Rhine",
      },
      image: "🎉",
      date: "2026-06-05",
      readTime: 6,
      tags: ["فرهنگ", "جشن‌ها"],
    },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "📚 وبلاگ آموزشی" : "📚 Educational Blog"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "با فرهنگ و اصطلاحات آلمانی آشنا شوید"
            : "Discover German culture and idioms"}
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label[language]}
          </Button>
        ))}
      </div>

      {/* Blog Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="bordered"
              padding="lg"
              hover
              className="h-full flex flex-col"
            >
              <div className="text-4xl mb-4">{post.image}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" size="xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {post.title[language]}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 flex-1">
                {post.excerpt[language]}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.date).toLocaleDateString(
                    language === "fa" ? "fa-IR" : "en-US",
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime} min
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-primary-500 hover:text-primary-600"
                icon={ArrowRight}
                iconPosition="right"
              >
                {language === "fa" ? "ادامه مطلب" : "Read More"}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">
            {language === "fa"
              ? "هیچ پستی در این دسته‌بندی وجود ندارد."
              : "No posts in this category."}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BlogPage;
