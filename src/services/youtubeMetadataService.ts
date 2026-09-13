import type { Episode, YouTubeMetadata } from '../types';

export function generateYouTubeMetadata(episode: Episode): YouTubeMetadata {
  const { seriesTitle, episodeNumber, title, theme, ageGroup, scenes, outroMoral } = episode;

  const formattedTitle = `✨ ${title} | Kids Story & Daily Cartoon Episode ${episodeNumber} | ${seriesTitle}`;

  // Chapter timestamps
  let currentSec = 0;
  const chapters = scenes.map((scene) => {
    const mins = Math.floor(currentSec / 60);
    const secs = Math.floor(currentSec % 60);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const chapterItem = {
      time: timeStr,
      title: scene.title
    };
    currentSec += scene.durationSec;
    return chapterItem;
  });

  const description = `🎈 Welcome to Episode ${episodeNumber} of "${seriesTitle}"!
In today's exciting 5+ minute episode: ${title}.

🌟 Moral Lesson: ${outroMoral}
👶 Target Audience: Age ${ageGroup} years old.

⏱️ TIMESTAMPS & CHAPTERS:
${chapters.map(c => `${c.time} - ${c.title}`).join('\n')}

💡 WHY KIDS LOVE THIS SERIES:
- Wholesome, safe, and positive animated adventures
- Fun interactive quiz & character lessons
- Bright visual animations & educational values

🔔 Don't forget to LIKE, SUBSCRIBE, and ring the BELL to never miss our daily episodes!

#KidsStory #DailyEpisode #YouTubeAutomation #CartoonsForKids #BedtimeStory #KidFriendly #EducationalStories #${seriesTitle.replace(/\s+/g, '')}`;

  const tags = [
    seriesTitle,
    `episode ${episodeNumber}`,
    'kids story',
    'daily cartoon',
    'bedtime story',
    '5 minute kids story',
    'cartoons for kids',
    'educational kids story',
    'youtube automation kids',
    'moral stories for children',
    'preschool learning',
    'fun story for toddlers',
    theme
  ];

  return {
    title: formattedTitle,
    description,
    tags,
    category: 'Education / Entertainment',
    chapters,
    madeForKids: true
  };
}
