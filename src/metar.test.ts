import { parseMETAR } from "./metar";

import * as chai from "chai";

const expect = chai.expect;

const kjfkMETAR = "METAR KJFK 250251Z 08006KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkSPECI = "SPECI KJFK 250251Z 08006KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkUndef = "KJFK 250251Z 08006KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";

const kjfkAUTO = "KJFK 250251Z AUTO 08006KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkCOR = "KJFK 250251Z COR 08006KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";

const kjfkCalm = "METAR KJFK 250251Z 00000KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkVrb = "METAR KJFK 250251Z VRB06KT 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkVrbG6 = "METAR KJFK 250251Z 21010G10KT 180V240 10SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";

const kjfkMinVis = "METAR KJFK 250251Z 21010G10KT 180V240 M1/4SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkLowVis = "METAR KJFK 250251Z 21010G10KT 180V240 1/4SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";
const kjfkMixVis = "METAR KJFK 250251Z 21010G10KT 180V240 1 5/16SM BKN043 BKN095 BKN250 19/09 A3034 RMK AO2 SLP273 T01890094 50001";

describe("METAR vs. SPECI", () => {
	it("should know that a METAR is a routine observation", () => {
		const metar = parseMETAR(kjfkMETAR);
		expect(metar.type).to.equal("routine", "METAR");
	});

	it("should know that a SPECI is a condition-based or special forecast", () => {
		const speci = parseMETAR(kjfkSPECI);
		expect(speci.type).to.equal("special", "SPECI");
	});

	it("should handle a truncated format", () => {
		const undef = parseMETAR(kjfkUndef);
		expect(undef.type).to.equal("unknown", "Unspecified");
	});
});

describe("Station identifier", () => {
	it("should know the station identifier", () => {
		const metar = parseMETAR(kjfkMETAR);
		expect(metar.stationIdentifier).to.equal("KJFK");
	});

	it("should know the station identifier, even if the report type is unspecified", () => {
		const metar = parseMETAR(kjfkUndef);
		expect(metar.stationIdentifier).to.equal("KJFK");
	});
});

describe("Time parsing", () => {
	it("should parse times correctly", () => {
		const metar = parseMETAR(kjfkMETAR);

		expect(metar.time.day).to.equal(25);
		expect(metar.time.hour).to.equal(2);
		expect(metar.time.minute).to.equal(51);
	});

	it("should parse time even if the report type is unspecified", () => {
		const metar = parseMETAR(kjfkMETAR);
		const undef = parseMETAR(kjfkUndef);

		expect(metar.time).to.deep.equal(undef.time);
	});
});

describe("Respect modifiers", () => {
	it("should handle reports without a respect modifier", () => {
		const kjfk = parseMETAR(kjfkMETAR);
		expect(kjfk.respectModifier).to.equal("unknown");
	});

	it("should handle corrected reports", () => {
		const kjfkCor = parseMETAR(kjfkCOR);
		expect(kjfkCor.respectModifier).to.equal("correction");
	});

	it("should handle automatic reports", () => {
		const kjfkAuto = parseMETAR(kjfkAUTO);
		expect(kjfkAuto.respectModifier).to.equal("automatic");
	});
});

describe("Wind parsing", () => {
	it("should parse calm winds", () => {
		const calm = parseMETAR(kjfkCalm);
		expect(calm.wind.calm).to.equal(true);
		expect(calm.wind.direction).to.equal("calm");
		expect(calm.wind.variance).to.equal(null);
		expect(calm.wind.speed).to.equal(0);
	});

	it("should parse winds without gusts", () => {
		const kjfk = parseMETAR(kjfkMETAR);
		expect(kjfk.wind.calm).to.equal(false);
		expect(kjfk.wind.variance).to.equal(null);
		expect(kjfk.wind.direction).to.equal(80);
		expect(kjfk.wind.speed).to.equal(6);
	});

	it("should parse variable direction winds (<=6kts)", () => {
		const vrb = parseMETAR(kjfkVrb);
		expect(vrb.wind.direction).to.equal("variable");
		expect(vrb.wind.variance).to.equal(null);
		expect(vrb.wind.speed).to.equal(6);
	});

	it("should parse variable direction winds (>6kts)", () => {
		const vrbG6 = parseMETAR(kjfkVrbG6);
		expect(vrbG6.wind.direction).to.equal(210);
		expect(vrbG6.wind.variance).to.deep.equal([180, 240]);
	});

	it("should handle gusts properly", () => {
		const vrbG6 = parseMETAR(kjfkVrbG6);
		expect(vrbG6.wind.gust).to.equal(10);
	});
});

describe("visibilityParsing", () => {
	it("should know when the visibility is less than a number", () => {
		const minVis = parseMETAR(kjfkMinVis);
		const lowVis = parseMETAR(kjfkLowVis);
		expect(minVis.visibilityLessThan).to.equal(true);
		expect(lowVis.visibilityLessThan).to.equal(false);
		expect(minVis.visibility).to.equal(lowVis.visibility);
	});

	it("should parse whole number visibilities correctly", () => {
		const vis = parseMETAR(kjfkMETAR);
		expect(vis.visibility).to.equal(10);
	});

	it("should parse fractional visibilities correctly", () => {
		const lowVis = parseMETAR(kjfkLowVis);
		expect(lowVis.visibility).to.equal(1 / 4);
	});

	it("should parse mixed number visibilities correctly", () => {
		const mixVis = parseMETAR(kjfkMixVis);
		expect(mixVis.visibility).to.equal(21 / 16);
	});
});