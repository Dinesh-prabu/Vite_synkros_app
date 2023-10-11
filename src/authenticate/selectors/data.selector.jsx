import SynkUI from '../../encryption/synkui'
import { Buffer } from 'buffer'


const getSlice = (state, path) => { return state.keyAction[path]}

const getKey = state => SynkUI.getSharedSecureKey(
  () => getSlice(state, "data").key
).then(key => key ? Buffer.from(key, 'hex') : key)

// eslint-disable-next-line import/no-anonymous-default-export
export default {getKey};
