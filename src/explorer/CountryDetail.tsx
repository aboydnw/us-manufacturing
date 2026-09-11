import type { ResolvedSupplyMix } from "../data/schema";

interface Props {
  code: string;
  mix: ResolvedSupplyMix;
}

export function CountryDetail({ code, mix }: Props) {
  const country = mix.countries.find((item) => item.countryCode === code);
  if (!country) {
    return (
      <p>The selected country is not part of this stage's source series.</p>
    );
  }
  const percentage =
    country.value === null
      ? null
      : (country.value / mix.denominatorValue) * 100;
  return (
    <article className="panel-detail">
      <p className="panel-detail__eyebrow">{country.originType} origin</p>
      <h2>{country.countryName}</h2>
      <p className="country-detail__share">
        {percentage === null
          ? "Unknown"
          : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(percentage)}%`}
      </p>
      <p>
        {country.value === null
          ? "The U.S. value is missing; it has not been treated as zero."
          : `${country.value.toLocaleString()} ${mix.unit} of a ${mix.denominatorValue.toLocaleString()} ${mix.unit} denominator in ${mix.period}.`}
      </p>
      <p className="panel-detail__caveat">{mix.limitation}</p>
      <a href={mix.source.url} target="_blank" rel="noreferrer">
        View source <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
