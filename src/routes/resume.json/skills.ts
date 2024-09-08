import { experiences } from '$lib/data/experiences';
import { DateTime, Interval, Duration } from 'luxon';
import humanizeDuration from 'humanize-duration';

const keywordIntervals: Record<string, Interval[]> = {};
for (const experience of experiences) {
	for (const keyword of experience.keywords) {
		const intervals = keywordIntervals[keyword] ?? [];
		const { startDate, endDate } = experience;
		const start = DateTime.fromISO(startDate);
		const end = endDate ? DateTime.fromISO(endDate) : DateTime.now();
		intervals.push(Interval.fromDateTimes(start, end));
		keywordIntervals[keyword] = intervals;
	}
}

const _skills = Object.entries(keywordIntervals).map(([skill, intervals]) => {
	const merged = Interval.merge(intervals);
	const duration = merged.reduce(
		(accumulator: Duration, interval) => accumulator.plus(interval.toDuration()),
		Duration.fromMillis(0)
	);
	return {
		name: skill,
		duration,
		level: humanizeDuration(duration.toMillis(), { units: ['y', 'mo'], round: true })
	};
});

_skills.sort((a, b) => {
	return b.duration.toMillis() - a.duration.toMillis();
});

export const skills = _skills.map(({ name, level }) => ({ name, level }));