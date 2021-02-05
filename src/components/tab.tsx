/**
 * SkoshX (https://skoshx.com)
 * Tab component
 */

import { h, ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  animation,
  SpringTypes,
  PropertySetter,
  SetterFunction
} from "../animation";
import { Spring } from "wobble";
import { capitalize } from "../util";

export interface TabSwitcherProps {
  tabs: string[];
  styles?: string | { [key: string]: string | number };
  onChange?: (tab: number) => void;
}

export const TabSwitcher = (props: TabSwitcherProps) => {
  const pill = useRef(null);
  const tabSwitcherElement = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

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

export const FadeAnimation = ({
  children,
  className,
}: {
  children?: ComponentChildren;
  className?: string;
}) => {
  const [opacity, setOpacity] = useState<number>(0);
  const fadeDescription = { from: 0, to: 1 };
  const OpacitySetter: SetterFunction = (
    element: HTMLElement,
    spring: Spring
  ) => {
    setOpacity(spring.currentValue);
  };
  useEffect(() => {
    (async () => {
      await animation(fadeDescription, null, OpacitySetter);
    })();
  }, []);
  return (
    <div className={className} style={{ opacity: opacity }}>
      {children}
    </div>
  );
};

export const Tab = (props: { tab: number; children: ComponentChildren[] }) => {
  const tabRef = useRef(null);
  useEffect(() => {
    // Fade out, then fade in
    // const desc = { from: 0, to: tabRef.current.scrollHeight };
    // collapse(tabRef.current);
    // expand(tabRef.current);
    /*animation(desc, tabRef.current, (el: HTMLElement, s: Spring) => {
      el.style.height = s.currentValue + 'px';
    });*/
  }, [props.tab]);
  return (
    <div style="width: 100%; height: 100%;" ref={tabRef}>
      {props.children[props.tab]}
    </div>
  );
  // return props.children[props.tab];
};
