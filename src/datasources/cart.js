import { RESTDataSource } from 'apollo-datasource-rest';
import CatalogAPI from './catalog';
import {GoogleAuth} from 'google-auth-library';

const auth = new GoogleAuth();

class CartAPI extends RESTDataSource {

  constructor(DEBUG) {
    super();
    if (DEBUG) this.debug = true;
    this.baseURL = `https://${process.env.CART_HOST + '-' + process.env.SUFFIX || 'localhost'}/cart`;
    this.catalog = new CatalogAPI(DEBUG);
  }

  async willSendRequest(request) {
    let client = await auth.getIdTokenClient(`https://cart-${process.env.SUFFIX}`);
    let headers = await client.getRequestHeaders();

    if (this.debug) console.log('Setting bearer token with google-auth-library', headers.Authorization);
    request.headers.set('Authorization', headers.Authorization);
  }

  async getCarts() {
    const response = await this.get('')
      .then( r => {
        if (this.debug) console.log("I'm a cart teapot: %j", r);
        return r;
      })
      .catch( e => {
        console.error({"error": e});
      });
      return Array.isArray(response)
        ? response.map(m => this.cartReducer(m))
        : [];
  }

  async getCartByEmail(email) {
    if (this.debug) console.log("Entering getCartByEmail and calling url: %s", `${this.baseURL}?email=${email}`);
    const response = await this.get(`?email=${email}`)
      .then( r => {
        if (this.debug) console.log("I'm a little catalog teapot: %j", r); return r; })
      .catch( e => {
        console.error({"error": e});
      });
      return this.cartReducer(response);
  }

  async cartReducer(m) {
    if (this.debug) console.log("Entering the cartReducer with: %j", m);
    this.catalog.initialize({});

    let items = await m.items.map( async i => {
      let item = await this.catalog.getCatalogItemById(i.ref);
      let amount = i.quantity;
      return {
        id: m._id,
        md: item,
        quantity: amount
      };
    })
    let reduced = {
      id: m._id,
      email: m.email,
      items: items
    };
    if (this.debug) console.log("catalog reduced: %j", reduced);
    return reduced;
  }
}
  
export default CartAPI;
