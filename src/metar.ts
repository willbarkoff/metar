/**
 * @packageDocumentation
 * 
 * @author Will Barkoff <william@barkoffusa.com>
 * @license MIT
 * 
 * @see https://www.icams-portal.gov/publications/fmh/FMH1/FMH1.pdf _Federal Meteorological Handbook No. 1: Surface Weather Observations and Reports_, referred to as FMH1.
 */

export { PhenomenaDescriptor, PhenomenaIntensity, Precipitation, Obscuration, WeatherPhenomena } from "./weather";
import { intensities, descriptors, precipitations, obscurations, phenomenon } from "./weather";

/**
 * WindDirection represents a direction of the wind. It is normally a number representing the direction of the wind in degrees.
 * It can also be `"calm"` if there are no winds, or `"variable"` if winds are variable but under 6 knots.
 */
export type WindDirection = number | "calm" | "variable"

export type ReportTime = {
	/**
	 * `day` represents the day of the month of the report, in UTC.
	 */
	day: number,

	/**
	 * `hour` represents the hour of the report, in UTC
	 */
	hour: number,

	/**
	 * `minute` represents the minute of the report, in UTC
	 */
	minute: number
}

/**
 * `RespectModifier` represents the respect modifier of a report.
 */
export type RespectModifier = "automatic" | "correction" | "unknown"

export type Wind = {
	/**
	 * `calm` is true if the winds are calm (reporting `00000KT` in the METAR).
	 */
	calm: boolean

	/**
	 * `direction` is the direction, in degrees, that the wind is blowing. If winds are calm, the direction is `-1`.
	 */
	direction: WindDirection

	/**
	 * `variance` is the directional variance of the wind. If a directional variance is not specified, it is `null`.
	 * Otherwise, it is the 
	 */
	variance: null | [number, number]

	/**
	 * `speed` is the wind speed.
	 */
	speed: number

	/**
	 * `guest` represents the gust speed of the wind.
	 */
	gust: number
}

export type METAR = {
	/**
	 * `type` indicates the type of the report
	 * 
	 * If this is a routine report, it is `routine`. If this is a special report, it is `special`. Otherwise, it is `unknown`.
	 * 
	 * @example `routine` when the METAR includes `METAR`.
	 * @example `special` when the METAR includes `SPECI`.
	 * @see FMH1 section 12.6.1
	 */
	type: "routine" | "special" | "unknown"

	/**
	 * `stationIdentifier` is the identifier of the reporting station.
	 * @example `KJFK` for John F. Kennedy Interational Airport
	 * @example `EGLL` for Heathrow Airport
	 * @see FMH1 section 12.6.2
	 */
	stationIdentifier: string

	/**
	 * `time` represents the time of the report. The day of the month, the hour, and the minute are reported. These are reported in UTC or Zulu time.
	 *
	 * @example `{day: 10, hour: 3, minute: 12}` would represent `100312Z` in the METAR. 
	 * @see FMH1 section 12.6.3
	 */
	time: ReportTime

	/**
	 * `respectModifier` represents the respect modifier of the report.
	 * - `automatic` if the report had no human intervention (`AUTO` in the METAR report)
	 * - `correction` if the report had a human correction (`COR` in the METAR report)
	 * - `unknown` if the field was omitted from the report, or another value was provided.
	 * 
	 * @see FMH1 section 12.6.4
	 */
	respectModifier: RespectModifier

	/**
	 * `wind` represents the wind at the time of the report.
	 * 
	 * @see FMH1 section 12.6.5
	 */
	wind: Wind

	/**
	 * `visibility` represents the visibility at the time of the report. It is reported in statue miles (SM).
	 * 
	 * @see FMH1 section 12.6.6
	 * @see FMH1 table 12-1
	 * @see FMH1 chapter 6
	 */
	visibility: number

	/**
	 * `visibilityLessThan` represents how the {@link visibility} should be understood. If it is `true`, then the 
	 * visibility is less than the number reported in {@link visibility}, otherwise, it is equal to it.
	 * 
	 * @see FMH1 section 12.6.6
	 * @see FMH1 chapter 6
	 */
	visibilityLessThan: boolean
}

/**
 * Parses a US METAR
 * @param metarStr the string of the METAR
 * @returns the parsed METAR
 */
export function parseMETAR(metarStr: string): METAR {
	const strSegments = metarStr.split(" ");

	// first, we'll parse the first segment.
	// FMH1 12.6.1

	let type: "routine" | "special" | "unknown" = "unknown";
	if (strSegments[0] == "METAR") {
		type = "routine";
		strSegments.shift();
	} else if (strSegments[0] == "SPECI") {
		type = "special";
		strSegments.shift();
	}

	// next, we'll grab the station identifier.
	const stationIdentifier = strSegments[0];
	strSegments.shift();

	// next, we'll take the time
	const [, dayStr, hourStr, minuteStr] = strSegments[0].match(/(\d\d)(\d\d)(\d\d)Z/)
		|| /* istanbul ignore next */[-1, -1, -1, -1];
	const time = {
		day: parseInt(dayStr as string),
		hour: parseInt(hourStr as string),
		minute: parseInt(minuteStr as string)
	};

	strSegments.shift();

	// up next is the automatic identifier
	let respectModifier: RespectModifier = "unknown";
	if (strSegments[0] == "AUTO") {
		respectModifier = "automatic";
		strSegments.shift();
	} else if (strSegments[0] == "COR") {
		respectModifier = "correction";
		strSegments.shift();
	}

	const windRegex = /(((00000)|((\d{3}|VRB))(\d{2,3})(G(\d{2,3}))?))KT/;
	const windMatches = strSegments[0].match(windRegex);

	let calm = false;
	let direction: WindDirection = 0;
	let speed = 0;
	let gust = 0;

	// istanbul ignore next, because right now we aren't testing invalid METARS
	if (!windMatches) {
		throw new Error(`METARError: Expected winds group, got ${strSegments[0]}`);
	}

	if (windMatches[0] == "00000KT") {
		calm = true;
		direction = "calm";
	} else if (windMatches[4] == "VRB") {
		direction = "variable";
	} else {
		direction = parseInt(windMatches[4]);
	}

	if (!calm) {
		speed = parseInt(windMatches[6]);
		gust = parseInt(windMatches[8]);
	}

	let variance: [number, number] | null = null;
	const varianceMatches = strSegments[1].match(/(\d{3})V(\d{3})/);
	if (varianceMatches && strSegments[1] == varianceMatches[0]) {
		// we have a variance clause
		variance = [parseInt(varianceMatches[1]), parseInt(varianceMatches[2])];

		strSegments.shift();
	}

	strSegments.shift();

	const wind: Wind = { calm, direction, variance, speed, gust };

	// visibility

	let visibilityClause = "";
	let visibility = 0;
	while (!visibilityClause?.endsWith("SM")) {
		visibilityClause += " " + strSegments.shift();
		if (strSegments.length == 0) {
			throw new Error(`METARError: Expected visibility clause, got end of report (while reading ${visibilityClause}).`);
		}
	}

	const visMatches = visibilityClause.match(/(M)?((\d+)|((\d{1,2})\/(\d{1,2}))|((\d+) (\d{1,2})\/(\d{1,2})))SM/);

	if (!visMatches) {
		throw new Error(`METARError: Invalid visibility specification: ${visibilityClause}`);
	}

	const visibilityLessThan = visMatches[1] == "M";

	if (visMatches[3]) {
		// SCENERIO 1
		// so, there are a few ways this can happen, either visibility is an integer, in which case capture group 3 is equal to that integer
		visibility = parseInt(visMatches[3]);
	} else if (visMatches[5] && visMatches[6]) {
		// SCENERIO 2
		// or it's JUST a fraction, in which case group 5 is the numerator, and group 6 is the denominator
		visibility = parseInt(visMatches[5]) / parseInt(visMatches[6]);
	} else if (visMatches[8] && visMatches[9] && visMatches[10]) {
		// SCENERIO 3
		// or it's a mixed number, because we're too cool for improper fractions and decimals. it's equal to group 8 + group 9 / group 10
		visibility = parseInt(visMatches[8]) + (parseInt(visMatches[9]) / parseInt(visMatches[10]));
	}


	return { type, stationIdentifier, time, respectModifier, wind, visibility, visibilityLessThan };
}