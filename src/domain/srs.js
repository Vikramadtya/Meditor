export const srsService = {
  calculateNextReview(quality, ease, interval) {
    let newEase = ease;
    let newInterval = interval;

    if (quality < 3) {
      newInterval = 1; // Or 0 if you want to repeat same day
    } else {
      if (quality === 3) {
        newInterval = 1;
        newEase -= 0.15;
      } else if (quality === 4) {
        if (interval === 0) newInterval = 1;
        else if (interval === 1) newInterval = 6;
        else newInterval = Math.round(interval * ease);
      } else if (quality === 5) {
        if (interval === 0) newInterval = 1;
        else if (interval === 1) newInterval = 6;
        else newInterval = Math.round(interval * ease * 1.3);
        newEase += 0.15;
      }
    }

    if (newEase < 1.3) newEase = 1.3;

    // Calculate new timestamp (interval is in days)
    const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

    return { ease: newEase, interval: newInterval, nextReview };
  },
};
