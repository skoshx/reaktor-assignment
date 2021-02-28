/**
 * SkoshX (https://skoshx.com)
 * Main app component
 */

import { h, render, Component } from "preact";
import Router from "preact-router";
// CSS
import "./styles/style.scss";

import { Header } from "./components/header";
import { TabSwitcher } from "./components/tab";
import { Progress } from "./components/progress";
import { EventEmitter } from "./event";
import { ProductComponent } from "./components/product";

interface Props {}
interface State {
  tab: number;
}

// The tabs in the app
export const TABS = ["gloves", "facemasks", "beanies"];

class App extends Component<Props, State> {
  constructor() {
    super();

    // Initialize state
    this.state = { tab: this._getCurrentTab() };

    // Scroll listener to dynamically add products when user
    // has scrolled to the bottom.
    document.addEventListener('scroll', () => {
      if ((window.innerHeight + window.pageYOffset) >= document.body.scrollHeight * 0.9) {
        EventEmitter.emit("AddProducts");
      }
    }, { passive: true });
  }
  
  private _getCurrentTab() {
    for (let i = 0; i < TABS.length; i++) {
      if (location.pathname === `/${TABS[i]}`) return i;
    }
    return 0;
  }

  componentDidUpdate() {
    // Update path
    history.pushState(null, "", `/${TABS[this.state.tab]}`);
  }

  render() {
    return (
      <div>
        <div className="main-container u-flex-center-horizontal u-spacing">
          <Header />
          <TabSwitcher
            onChange={async (tab: number) => {
              this.setState({ tab });
            }}
            tabs={TABS}
            active={this.state.tab}
          />
          <Router>
            <ProductComponent path="/:product" tab={this.state.tab} />
            <ProductComponent path="/" tab={this.state.tab} />
          </Router>
        </div>
        <Progress />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
