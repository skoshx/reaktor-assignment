/**
 * SkoshX (https://skoshx.com)
 * Tab component
 */

import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  animation,
  SpringTypes,
  PropertySetter
} from "../animation";
import { capitalize } from "../util";

export interface TabSwitcherProps {
  tabs: string[];
  active: number;
  styles?: string | { [key: string]: string | number };
  onChange?: (tab: number) => void;
}

export const TabSwitcher = (props: TabSwitcherProps) => {
  const pill = useRef(null);
  const tabSwitcherElement = useRef(null);
  const [activeTab, setActiveTab] = useState(props.active);

  const tabs = props.tabs.map((item: string, index: number) => {
    return (
      <div
        className={"tab" + (activeTab === index ? " active" : "")}
        onClick={() => {
          setActiveTab(index);
          props?.onChange(index);
        }}
      >
        {capitalize(item)}
      </div>
    );
  });

  useEffect(() => {
    // Animate pill
    const currentLeft = pill.current.offsetLeft;
    const currentWidth = parseFloat(getComputedStyle(pill.current).width);
    const activeItem = tabSwitcherElement.current.querySelector(".active");
    const activeWidth = parseFloat(getComputedStyle(activeItem).width);
    const activeLeft = activeItem.offsetLeft;
    animation(
      { from: currentWidth, to: activeWidth },
      pill.current,
      PropertySetter("width", "px"),
      null,
      SpringTypes.SLOWED
    );
    animation(
      { from: currentLeft, to: activeLeft },
      pill.current,
      PropertySetter("left", "px"),
      null,
      SpringTypes.SLOWED
    );
  }, [activeTab]);
  return (
    <div className="tab-switcher" ref={tabSwitcherElement} style={props.styles}>
      <div className="background-pill tab" ref={pill}></div>
      {...tabs}
    </div>
  );
};
