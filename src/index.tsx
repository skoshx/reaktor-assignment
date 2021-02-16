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
import { Product, getProducts, TAvailability, getAvailabilityById, IndexableTemplateObject } from "./util";
import { useEffect, useRef, useState } from "preact/hooks";
import { expand, fadeIn, fadeOut } from "./animation";
import { Progress } from "./components/progress";
import { EventEmitter } from "./event";

export interface Props {}
export interface State {
  tab: number;
}

class App extends Component<Props, State> {
  private readonly TABS = ["gloves", "facemasks", "beanies"];

  constructor() {
    super();

    // Initialize state
    this.state = { tab: this._getCurrentTab() };

    // Scroll listener
    document.addEventListener('scroll', () => {
      if (window.scrollY > document.body.scrollHeight * 0.9) {
        EventEmitter.emit("AddProducts");
      }
    }, { passive: true });
  }
  
  private _getCurrentTab() {
    for (let i = 0; i < this.TABS.length; i++) {
      if (location.pathname === `/${this.TABS[i]}`) return i;
    }
    return 0;
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
        // if (availability) availabilityRef.current.style.height = '100%';
      }, [availability]);
      const buttonContent = loading ? "loading…" : "show availability";
      return (
        <div className="availability-container">
          <div className="button" onClick={showAvailability}>{buttonContent}</div>
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
      const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);
      const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
      EventEmitter.on("AddProducts", () => {
        // add products
        const newVisible = [...visibleProducts, ...loadedProducts.slice(0, Math.min(100, loadedProducts.length))];
        const newLoaded = loadedProducts.slice(Math.min(100, loadedProducts.length), loadedProducts.length);
        setVisibleProducts(newVisible);
        setLoadedProducts(newLoaded);
      });
      /*document.addEventListener('scroll', (e: MouseEvent) => {
        console.log("SCroll", window.scrollY, document.body.scrollHeight);
      }, { passive: true });*/
      useEffect(() => {
        (async () => { // Async IIFE since async useEffect is not yet implemented.
          await fadeOut(document.querySelector('.product-container'));
          let productsResult = await getProducts(product);
          // Visible products [0-100]
          // Loaded products [100-]
          setVisibleProducts(productsResult.slice(0, Math.min(100, productsResult.length)));
          setLoadedProducts(productsResult.slice(Math.min(100, productsResult.length), productsResult.length));
          await fadeIn(document.querySelector('.product-container'));
        })();
      }, [product]);
      const productElements = visibleProducts.map((product: Product, index: number) => {
        const colors = product.color.map((color) => {
          const colorObject: IndexableTemplateObject<string> = {
            blue: '#3498db', white: '#ecf0f1',
            green: '#2ecc71', yellow: '#f1c40f',
            grey: '#7f8c8d', red: '#e74c3c',
            black: '#222', purple: '#9b59b6'
          };
          return (
            <div className="color-circle" style={{backgroundColor: colorObject[color], width: '20px', height: '20px', borderRadius: '9999px', border: '2px solid #2c3e50', marginRight: '0.2rem'}}></div>
          );
        });
        return (
          <div className="product">
            <h2 style="color: var(--theme-color);">{product.name}</h2>
            <h6 class="h-small">{product.manufacturer}</h6>
            <h2 style="font-weight: 200;">{product.price}€</h2>
            <div className="color-container" style="display: flex; margin-bottom: 1.5rem;">
              {colors}
            </div>
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
            active={this.state.tab}
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
