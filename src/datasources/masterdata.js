import { RESTDataSource } from 'apollo-datasource-rest';
import {GoogleAuth} from 'google-auth-library';

const auth = new GoogleAuth();

class MasterdataAPI extends RESTDataSource {

  constructor(DEBUG) {
    super();
    if (DEBUG) this.debug = true;
    this.baseURL = `https://${process.env.MD_HOST + '-' + process.env.SUFFIX || 'localhost'}/md`;
  }

  async willSendRequest(request) {
    let client = await auth.getIdTokenClient(`https://md-${process.env.SUFFIX}`);
    let headers = await client.getRequestHeaders();

    if (this.debug) console.log('Setting bearer token with google-auth-library', headers.Authorization);
    request.headers.set('Authorization', headers.Authorization);
  }

  async getMasterdata() {
    const response = await this.get('')
      .then( r => {
        if (this.debug) console.log("I'm a little md teapot: %j", r);
        return r;
      })
      .catch( e => {
        console.error({"error": e});
      });
      return Array.isArray(response)
        ? response.map(m => this.masterdataReducer(m))
        : [];
  }

  async getMasterdataById(id) {
    const response = await this.get(`/${id}`)
      .then( r => {
        if (this.debug) console.log("I'm a little md teapot: %j", r);
        return r;
      })
      .catch( e => {
        console.error({"error": e});
      });
      return this.masterdataReducer(response);
  }

  async getMasterdataByName(name) {
    const response = await this.get(`?name=${name}`)
      .then( r => {
        if (this.debug) console.log("I'm a little md teapot: %j", r);
        return r;
      })
      .catch( e => {
        console.error({"error": e});
      });
      return this.masterdataReducer(response);
  }

  masterdataReducer(m) {
    return {
      md_id: m._id,
      img: m.img,
      name: m.name,
      desc: m.desc
    }
  }
}
  
//module.exports = MasterdataAPI;
export default MasterdataAPI;
