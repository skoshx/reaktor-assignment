/**
 * SkoshX (https://skoshx.com)
 * Main app component
 */

import { h, render, Component } from "preact";
import Router from "preact-router";
// CSS
import "./styles/style.scss";

import { Header } from "./components/header";
import { TabSwitcher, Tab } from "./components/tab";
import { Product, getProducts, TAvailability, getAvailabilityById } from "./util";
import { useEffect, useRef, useState } from "preact/hooks";
import { collapse, expand, fadeIn, fadeOut } from "./animation";
import { Progress } from "./components/progress";

export interface Props {}
export interface State {
  tab: number;
}

class App extends Component<Props, State> {
  private readonly TABS = ["gloves", "facemasks", "beanies"];

  constructor() {
    super();

    // Initialize state
    this.state = { tab: 0 };
  }

  componentDidUpdate() {
    // Update path
    history.pushState(null, "", `/${this.TABS[this.state.tab]}`);
  }

  render() {
    interface AvailabilityProps {
      manufacturer: string;
      id: string;
    }
    const Availability = ({ manufacturer, id }: AvailabilityProps) => {
      const [availability, setAvailability] = useState<TAvailability>(null);
      const availabilityRef = useRef<HTMLDivElement>(null);
      // Just a button that expands to show availability
      const showAvailability = async () => {
        const result = await getAvailabilityById(manufacturer, id);
        console.log("setting avail")
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
      return (
        <div className="availability-container">
          <div className="button" onClick={showAvailability}>show availability</div>
          <div className="availability" ref={availabilityRef} style="overflow: hidden; height: 0;">
            <h5 style="margin: 0;">Availability: {availabilityToString(availability)}</h5>
          </div>
        </div>
      )
    }
    interface ProductProps {
      path: string;
      product?: string;
    }
    const Product = (props: ProductProps) => {
      const product = this.TABS[this.state.tab];
      const [products, setProducts] = useState<Product[]>([]);
      useEffect(() => {
        (async () => { // Async IIFE since async useEffect is not yet implemented.
          // await fadeOut(document.querySelector('.product-container'));
          setProducts(await getProducts(product));
          // await fadeIn(document.querySelector('.product-container'));
        })();
      }, [product]);
      console.log(products);
      const productElements = products.map((product: Product, index: number) => {
        const colors = product.color.join(", ");
        // TODO: Availability
        return (
          <div className="product u-shadow u-spacing">
            <h2 style="color: var(--theme-color);">{product.name}</h2>
            <h6 class="h-small">{product.manufacturer}</h6>
            <h1 style="font-weight: 200;">{product.price}€</h1>
            <h5>Colors: {colors}</h5>
            <Availability manufacturer={product.manufacturer} id={product.id} />
          </div>
        );
      });
      return (
        <div className="product-container u-spacing-30">
          {productElements}
        </div>
      );
    }
    return (
      <div>
        <div
          className="main-container u-flex-center-horizontal u-spacing"
          style="padding: 0 2rem;"
        >
          <Header />
          <TabSwitcher
            onChange={async (tab: number) => {
              this.setState({ tab });
            }}
            tabs={this.TABS}
          />
          <Router>
            <Product path="/:product" />
            <Product path="/" />
          </Router>
        </div>
        <Progress />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
