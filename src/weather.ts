export const weatherRegEx = /(-|\+|VC)?(MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP)?(BR|FG|FU|VA|DU|SA|HZ|PY)?(PO|SQ|FC|SS|DS)?/;
export enum PhenomenaIntensity {
	Light = "light",
	Moderate = "moderate",
	Heavy = "heavy",
	Vicinity = "vicinity"
}
export enum PhenomenaDescriptor {
	Shallow = "shallow",
	Partial = "partial",
	Patches = "patches",
	LowDrifting = "low drifting",
	Blowing = "blowing",
	Showers = "showers",
	Thunderstorms = "thunderstorm",
	Freezing = "freezing",
}
export enum Precipitation {
	Drizzle = "drizzle",
	Rain = "rain",
	Snow = "snow",
	SnowGrains = "snow grains",
	IceCrystals = "ice crystals",
	IcePellets = "ice pellets",
	Hail = "hail",
	SnowPellets = "snow pellets",
	Unknown = "unknown"
}

export enum Obscuration {
	Mist = "mist",
	Fog = "fog",
	Smoke = "smoke",
	VolcanicAsh = "volcanic ash",
	Dust = "widespread dust",
	Sand = "sand",
	Haze = "haze",
	Spray = "spray"
}

export enum WeatherPhenomena {
	Whirls = "whirls",
	Squalls = "squalls",
	FunnelCloud = "funnel cloud",
	Sandstorm = "sandstorm",
	Duststorm = "duststorm"
}

export const intensities: Record<string, PhenomenaIntensity> = {
	"": PhenomenaIntensity.Moderate,
	"+": PhenomenaIntensity.Heavy,
	"-": PhenomenaIntensity.Light,
	"VC": PhenomenaIntensity.Vicinity
};

export const descriptors: Record<string, PhenomenaDescriptor> = {
	"MI": PhenomenaDescriptor.Shallow,
	"PR": PhenomenaDescriptor.Partial,
	"BC": PhenomenaDescriptor.Patches,
	"DR": PhenomenaDescriptor.LowDrifting,
	"BL": PhenomenaDescriptor.Blowing,
	"SH": PhenomenaDescriptor.Showers,
	"TS": PhenomenaDescriptor.Thunderstorms,
	"FZ": PhenomenaDescriptor.Freezing,
};

export const precipitations: Record<string, Precipitation> = {
	"DZ": Precipitation.Drizzle,
	"RA": Precipitation.Rain,
	"SN": Precipitation.Snow,
	"SG": Precipitation.SnowGrains,
	"IC": Precipitation.IceCrystals,
	"PL": Precipitation.IcePellets,
	"GR": Precipitation.Hail,
	"GS": Precipitation.SnowPellets,
	"UP": Precipitation.Unknown,
};

export const obscurations: Record<string, Obscuration> = {
	"BR": Obscuration.Mist,
	"FG": Obscuration.Fog,
	"FU": Obscuration.Smoke,
	"VA": Obscuration.VolcanicAsh,
	"DU": Obscuration.Dust,
	"SA": Obscuration.Sand,
	"HZ": Obscuration.Haze,
	"PY": Obscuration.Spray
};

export const phenomenon: Record<string, WeatherPhenomena> = {
	"PO": WeatherPhenomena.Whirls,
	"SQ": WeatherPhenomena.Squalls,
	"FC": WeatherPhenomena.FunnelCloud,
	"SS": WeatherPhenomena.Sandstorm,
	"DS": WeatherPhenomena.Duststorm,
};