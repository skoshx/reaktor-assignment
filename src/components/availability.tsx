/**
 * SkoshX (https://skoshx.com)
 * Header component
 */

import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { expand } from "../animation";
import { getAvailabilityById, TAvailability } from "../util";

export interface AvailabilityProps {
  manufacturer: string;
  id: string;
}

export const Availability = ({ manufacturer, id }: AvailabilityProps) => {
  const [availability, setAvailability] = useState<TAvailability>(null);
  const [loading, setLoading] = useState(false);
  const availabilityRef = useRef<HTMLDivElement>(null);
  // Just a button that expands to show availability
  const showAvailability = async () => {
    setLoading(true);
    const result = await getAvailabilityById(manufacturer, id);
    setLoading(false);
    setAvailability(result);
  }
  const availabilityToString = (availability: TAvailability) => {
    const availabilityStrings = {
      instock: "In stock", lessthan10: "Less than 10",
      outofstock: "Out of stock", notfound: "Information not available"
    };
    return availabilityStrings[availability];
  }
  useEffect(() => {
    if (availability) expand(availabilityRef.current);
  }, [availability]);
  const buttonContent = loading ? "loading…" : "show availability";
  return (
    <div className="availability-container">
      <div className="button" onClick={showAvailability}>{buttonContent}</div>
      <div className="availability" ref={availabilityRef} style="overflow: hidden; height: 0;">
        <h5 style="margin: 0;">Availability: {availabilityToString(availability)}</h5>
      </div>
    </div>
  );
}
