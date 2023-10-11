import * as BRIDGE from './consts'
var jcefQuery;
console.log("synkui")
import debug from 'debug';

// const debug = require('debug-es')('app:synkui')
var __DEV__ = "development"

/** @private */

export const noop = () => { }
/** @private */

const missing = (action) => () => { debug(`Action not registered: ${action}`) }

const SINGLETON = Symbol('SINGLETON')
const SINGLETON_ENFORCER = Symbol('SINGLETON_ENFORCER')
// This is a list of functions that should not be overridden when listeners are added or removed.
const _forbiddenListeners = [
    'changePassword',
    'connect',
    'disconnect',
    'exit',
    'employeeStatusChanged',
    'getInstance',
    'getIOP',
    'getSession',
    'getWSUrl',
    'isSynkros',
    'menuUnregister',
    'navigate',
    'notifyEmployeeStatusChanged',
    'pageReady',
    'ready',
    'setKeyExchangeHeaderVal',
    'setSession',
    'showMenu',
    'menuRegister',
    'register',
    'unregister',
    'userLoggedIn',
    'wait',
    'version',
    '_employeeStatusChanged',
    '_loggedIn',
    '_ready',
    '_userLoggedIn'
]
/**
  * @class
  * This will handle requests that need to be directed to Synkros.
  * These methods are received by com.konami.jcef.MessageRouterHandler.java
  */

class Synkui {
    constructor(enforcer) {
        if (enforcer !== SINGLETON_ENFORCER) {
            throw new Error('Use getInstance')
        }
    }

    checkScanned = noop
    barCodeScanned = noop
    clear = noop
    disconnectOccured = noop
    employeeCardSwiped = noop
    employeeStatusChanged = noop
    favoritesChanged = noop
    find = noop
    findagain = noop
    patronCardSwiped = noop
    rolesChanged = noop
    save = noop

    _employeeStatusChanged = noop
    _loggedIn = false
    _onShowMenu = noop
    _ready = false
    _userLoggedIn = null

    /**
     * assigned in main.js
     * accepts a FLUX action and passes
     * it to store.dispatch()
     */
    bridgeDispatcher = null

    /**
     * ==========
     * Utility
     * ==========
     */

    static getInstance() {
        if (!Synkui[SINGLETON]) {
            Synkui[SINGLETON] = new Synkui(SINGLETON_ENFORCER)
        }
        return Synkui[SINGLETON]
    }

    /**
     * Checks if we are using the Synkros Wrapper
     * @return {boolean} isSynkros
     */

    isSynkros = () => window.navigator.userAgent.indexOf('Synkros') > -1

    /**
     * Receives json strings from wrapper and
     * delegates the call
     * @param {object} request A JSON object modeling the request.
     * I have no idea how this arrives already parsed - JPS
     * @param {string} request.command The key used to lookup the method
     * @param {array} request.args the args to apply to the command
     */
    jsQuery = request => this[request.command] && this[request.command](...request.args)

    // test receiver command - Unsure of its use REC
    TheCommand = (theString, int1, int2) => {
        console.log('Call me maybe!', theString, int1, int2)
    }

    /**
     * @private
     * Used to see if Synkros Java Bridge is ready or if in the browser
     * @return {Promise<boolean, error>} promise
     */

    ready = () => {
        debug('ready called')
        const promise = new Promise((resolve, reject) => {
            if (this.isSynkros()) {
                this._ready = !!window.cefQuery
                if (!this._ready) {
                    this.wait(resolve, reject)
                } else if (this._ready) {
                    debug('Synkros already ready')
                    resolve(true)
                }
            } else {
                debug('Not Synkros')
                resolve(false)
            }
        }).catch(reason => {
            console.error('Promise Catch: ready')
            console.error(reason)
        })
        return promise
    }

    /**
      * Register your component to listen for javascript calls from Synkros
      * @param {Object} listener
      * @param {?function()} listener.save
      * @param {?function()} listener.clear
      * @param {?function()} listener.find
      * @param {?function()} listener.findagain
      */

    register = (listener) => {
        Object.keys(listener).forEach(item => {
            if (_forbiddenListeners.indexOf(item) === -1) {
                this[item] = listener[item]
            }
        })
    }

    /**
     * Unregister your listener from SynkUI
     */
    unregister = (listener) => {
        if (!listener) {
            return
        }
        Object.keys(listener).forEach(item => {
            if (_forbiddenListeners.indexOf(item) === -1) {
                this[item] = noop
            }
        })
    }

    /**
     * ======================================================================
     * Java Commands for JavaScript to call
     * ======================================================================
     */

    /**
     * Used to send Change Password to Synkros or to open Change Password in the browser
     * @param {function()} synkros Callback for Synkros
     * @param {function()} web Callback for Browser
     * @return {Promoise<null, error>} promise
     */
    // changePassword = (synkros, web) => {
    //   const self = this
    //   return self.ready().then((isSynkros) => {
    //     if (isSynkros) {
    //       jcefQuery(BRIDGE.CHANGE_PASSWORD)()
    //       synkros && synkros()
    //     } else {
    //       web && web()
    //     }
    //   })
    // }

    /**
    * Clears any ids stored for the given primary key.
    * @param {string} primaryKey - Column name as string
    */
    // clearFollowingID = (primaryKey) => {
    //   if (this.isSynkros()) {
    //     jcefQuery(BRIDGE.CLEAR_FOLLOWING_ID, primaryKey)()
    //   }
    // }

    /**
     * Used to send disconnect message to Synkros or fires web callback.
     * @param {function()} synkros - Callback after user is logged out
     * @param {function()} web     - Callback for browser
     * @return {Promise<null, error>} promise
     */
    // disconnect = push => dispatch => {
    //   if (this.isSynkros()) {
    //     jcefQuery(BRIDGE.LOG_OFF_SYNKROS)()
    //     this._loggedIn = false
    //     this.menuUnregister()
    //     dispatch(SessionActions.user.logoutSynk(push))
    //   } else {
    //     document.cookie = 'logout=true; Secure; SameSite=Strict; Path=/;'
    //     dispatch(SessionActions.user.logout(push))
    //   }
    // }

    /**
    * Sends Exit message to Synkros. Returns a Promise
    * @param {function()} synkros - Callback if in Synkros
    * @param {function()} web     - Callback if not in Synkros
    * @returns {Promise<null, error>} promise
    */
    // exit = () => {
    //   const self = this
    //   return self.ready().then(isSynkros => {
    //     if (isSynkros) {
    //       jcefQuery(BRIDGE.EXIT_SYNKROS)()
    //       this.menuUnregister()
    //     }
    //   })
    // }

    // used to download an image - not currently working
    // getAndSavePatronImage = (patronId, typeId) => {
    //   return new Promise(() => {
    //     jcefQuery(BRIDGE.GET_AND_SAVE_PATRON_IMAGE, patronId, typeId)()
    //   })
    // }

    /**
     * Method that opens the thick client camera UI.If an image is captured a
     * scaled version of the image is returned as a 64 bit encoded image.
     * @param {number|null} iPreviewWidth     - Width of returned image in pixels. Can be null
     * @param {number|null} iPreviewHeight    - Height of returned image in pixels. Can be null.
     * @param {number|null} dPreviewScale     - Scale of Returned image. 1.0 would be original size.
     *                                          0.5 would be half size. Can be null.
     * @param {boolean}     bKeepAspectRatio  - Flag to preserve the aspect ratio of the image.
    */
    // getCameraImagePreview(iPreviewWidth, iPreviewHeight, dPreviewScale, bKeepAspectRatio) {
    //   if (this.isSynkros()) {
    //     return new Promise((resolve, reject) => {
    //       jcefQuery(BRIDGE.GET_CAMERA_IMAGE_PREVIEW, iPreviewWidth, iPreviewHeight, dPreviewScale, bKeepAspectRatio)(
    //         () => resolve(),
    //         (errCode, errMsg) => reject(new Error(errMsg))
    //       )
    //     })
    //   }
    //   return Promise.resolve()
    // }

    /**
     * Method that opens the thick client scanner UI.If an image is captured a
     * scaled version of the image is returned as a 64 bit encoded image.
     * @param {number|null} iPreviewWidth     - Width of returned image in pixels. Can be null
     * @param {number|null} iPreviewHeight    - Height of returned image in pixels. Can be null.
     * @param {number|null} dPreviewScale     - Scale of Returned image. 1.0 would be original size.
     *                                          0.5 would be half size. Can be null.
     * @param {boolean}     bKeepAspectRatio  - Flag to preserve the aspect ratio of the image.
    */
    // getScannerImagePreview(iPreviewWidth, iPreviewHeight, dPreviewScale, bKeepAspectRatio) {
    //   if (this.isSynkros()) {
    //     return new Promise((resolve, reject) => {
    //       jcefQuery(BRIDGE.GET_SCANNER_IMAGE_PREVIEW, iPreviewWidth, iPreviewHeight, dPreviewScale, bKeepAspectRatio)(
    //         () => resolve(),
    //         (errCode, errMsg) => reject(new Error(errMsg))
    //       )
    //     })
    //   }
    //   return Promise.resolve()
    // }

    // getFile = (windowTitle, ext, fileOfType) => {
    //   return new Promise((resolve, reject) => {
    //     jcefQuery(BRIDGE.GET_FILE, windowTitle, ext, fileOfType)(
    //       ({ value }) => resolve(value),
    //       (errCode, errMsg) => reject(new Error(errMsg))
    //     )
    //   })
    // }

    /**
    * Get ID of the given primary key that was loaded on previous form.
    * This is so if a patron was loaded on Form A when Web Form B loads
    * it knows to go ahead and load that patron.
    * @param   {string } str - string representing value to get
    * @returns {string}
    */
    // getFollowingID = str => {
    //   if (this.isSynkros()) {
    //     return new Promise((resolve, reject) => {
    //       jcefQuery(BRIDGE.GET_FOLLOWING_ID, str)(
    //         ({ value }) => resolve(value),
    //         (errCode, errMsg) => reject(new Error(errMsg))
    //       )
    //     })
    //   }
    //   return Promise.resolve(null)
    // }

    /**
     * Get the current gamesite id chosen during login process.
     */
    // getGamesite = () => {
    //   if (this.isSynkros()) {
    //     return new Promise((resolve, reject) => {
    //       jcefQuery(BRIDGE.GET_GAMESITE)(
    //         ({ value }) => resolve(value),
    //         (errCode, errMsg) => reject(new Error(errMsg))
    //       )
    //     })
    //   }
    //   return Promise.resolve()
    // }

    /**
    * Get IOP from Synkros or from redux store. Returns a Promise that returns the IOP.
    * @param {function()} web - Callback for browser
    * @return {Promise<string, error>} promise
    */
    // getIOP = web => {
    //   debug('SynkUI.synkGetIOP')
    //   return this.ready().then(isSynkros => {
    //     if (isSynkros) {
    //       return new Promise((resolve, reject) => {
    //         jcefQuery(BRIDGE.GET_IOP)(
    //           ({ value }) => resolve(value),
    //           (errCode, errMsg) => reject(new Error(errMsg))
    //         )
    //       })
    //     } else {
    //       return web()
    //     }
    //   })
    // }

    /**
  * Get sessionId from either Synkros or stored in redux session. Returns a Promise
  * that returns the sessionId.
  * @param {function()} sessionFromState - Callback if we are in a browser.
  * @return {Promise<string, error>} promise
  */

    // getSession = sessionFromState => {
    //   const self = this
    //   return self.ready().then((isSynkros) => {
    //     if (isSynkros) {
    //       return new Promise((resolve, reject) => {
    //         jcefQuery(BRIDGE.GET_SESSION)(
    //           ({ value }) => resolve(value),
    //           (errCode, errMsg) => reject(new Error(errMsg))
    //         )
    //       })
    //     }
    //     return sessionFromState()
    //   })
    // }

    getSharedSecureKey = web => {
        return this.ready().then(
            isSynkros => {
                if (isSynkros) {
                    return new Promise((resolve, reject) => {
                        jcefQuery(BRIDGE.GET_SHARED_SECURE_KEY)(
                            ({ value }) => resolve(value),
                            (_, errMsg) => reject(new Error(errMsg))
                        )
                    })
                } else {
                    return Promise.resolve(web())
                }
            }
        )
    }

    /**
     * Get the Webservice URL from Synkros
     * @returns {String|null} The address of the Webservice Server or null if in Browser
     */

    // getWSUrl = () => {
    //   return this.ready().then((isSynkros) => {
    //     if (isSynkros) {
    //       return new Promise((resolve, reject) => {
    //         jcefQuery(BRIDGE.GET_KONAMI_WEB_URI)(
    //           ({ value }) => resolve(value),
    //           (errCode, errMsg) => reject(new Error(errMsg))
    //         )
    //       })
    //     } else {
    //       return Promise.resolve(null)
    //     }
    //   })
    // }

    /**
     * Method returns if the thick client as a configured camera, or checks if there are cameras
     * connected to device through the browser. Returns a promise with a boolean in its results.
     */
    isCameraAvailable = () => {
        if (this.isSynkros()) {
            return new Promise((resolve, reject) => {
                jcefQuery(BRIDGE.IS_CAMERA_AVAILABLE)(
                    ({ value }) => resolve(value),
                    (errCode, errMsg) => reject(new Error(errMsg))
                )
            })
        }
    }

    /**
     * Method returns if the thick client as a configured scanner, or checks if there are cameras
     * connected to device through the browser. Returns a promise with a boolean in its results.
     */
    isScannerAvailable = () => {
        if (this.isSynkros()) {
            return new Promise((resolve, reject) => {
                jcefQuery(BRIDGE.IS_SCANNER_AVAILABLE)(
                    ({ value }) => resolve(value),
                    (errCode, errMsg) => reject(new Error(errMsg))
                )
            })
        }
    }

    javascriptReady = (text = 'default') => {
        const self = this
        debug('javacriptReady called')
        return self.ready().then(isSynkros => {
            if (isSynkros) {
                window.cefQuery && jcefQuery(BRIDGE.JAVASCRIPT_READY, text)()
                debug('javascriptReady fired')
            }
        })
    }

    /**
     * Used to send a message from the UI and post it to Synkros. This is so the
     * history of errors and messages are filled with messages from the web UI.
     * @param {string} type the type of message it is
     * @param {string} message the message that will be logged
     */
    logMessageToSynkros = (type, message) => {
        if (this.isSynkros()) {
            jcefQuery(BRIDGE.LOG_MESSAGE_TO_SYNKROS, type, message)()
        } else {
            switch (type) {
                case 'ERROR':
                case 'Error':
                    console.error(message)
                    break
                case 'WARNING':
                case 'Warning':
                    console.warn(message)
                    break
                default:
                    console.log(message)
                    break
            }
        }
    }

    /**
    * Used to navigate either directly in the browser or pass the next for to Synkros to handle.
    * @param {number} modid The module id
    * @param {number} menid The menu id
    * @param {number} itemid The item id
    * @param {?function()} synkros Callback for Synkros
    * @param {?function()} web Callback from browser
    * @return {Promise<null, error>} promise
    */

    navigate = (modid, menid, itemid) => {
        return this.ready().then((isSynkros) => {
            if (isSynkros) {
                jcefQuery(BRIDGE.LOAD_MENU_ITEM_BY_IDS, modid, menid, itemid)()
            }
        })
    }

    notifyEmployeeStatusChanged = () => (
        this.ready().then(
            isSynkros => {
                if (isSynkros) {
                    jcefQuery('notifyEmployeeStatusChanged')()
                }
                return Promise.resolve()
            }
        )
    )

    /**
    * Fires off a call to the wrapper that the page is ready to receive javascript
    */

    pageReady = (text = 'default') => {
        const self = this
        debug('pageReady called')
        return self.ready().then(() => {
            window.cefQuery && jcefQuery(BRIDGE.PAGE_READY, text)()
            debug('pageReady fired')
        })
    }

    pushImageCapture = byteString => {
        this.bridgeDispatcher({ type: BRIDGE.RECEIVE_JAVA_IMAGE, byteString })
    }

    /**
     * Prints Patron Card
     * Card will print with GST settings currently set in Synkros
     * @param {number} cardId - ID number of card to print
     * @return boolean
     */
    printCard = cardId => {
        if (this.isSynkros()) {
            jcefQuery(BRIDGE.PRINT_CARD, cardId)()
        }
        // in web browser, we will probably have a headless java application that we can
        // use to print cards from the web browser
    }

    /**
     * Will open java dialog box to print file associated with string accessKey
     */
    printServerFile = (accessKey, web) => {
        if (this.isSynkros()) {
            jcefQuery(BRIDGE.PRINT_SERVER_FILE, accessKey)()
        } else {
            web && web(accessKey)
        }
    }

    saveCSVFile = (title, extension, fileTypeDesc, csvFileType, meta) => {
        return new Promise((resolve, reject) => {
            jcefQuery(BRIDGE.SAVE_CSV_FILE, title, extension, fileTypeDesc, csvFileType, meta)(
                ({ value }) => resolve(value),
                (errCode, errMsg) => reject(new Error(errMsg))
            )
        })
    }

    setSession = (sessionId, ttl) => {
        const self = this
        return self.ready().then((isSynkros) => {
            if (isSynkros) {
                jcefQuery(BRIDGE.SET_SESSION, sessionId, ttl)()
            }
        })
    }

    setSharedSecureKey = secureKey => {
        return this.ready().then(
            isSynkros => {
                if (isSynkros) {
                    jcefQuery(BRIDGE.SET_SHARED_SECURE_KEY, secureKey)()
                }
            }
        )
    }

    setKeyExchangeHeaderVal = (publicKey, keyExchange, keyVerify) => (
        this.ready().then(
            isSynkros => {
                if (isSynkros) {
                    if (isSynkros) {
                        jcefQuery(BRIDGE.SET_KEY_EXCHANGE_HEADER_VAL, publicKey, keyExchange, keyVerify)()
                    }
                }
                return Promise.resolve()
            }
        )
    )

    /**
    * Used for Synkros screens only, sends connect command to open Synkros login dialog.
    * @returns {Promise<null, error>} promise
    */

    synkConnect = () => {
        if (this.isSynkros()) {
            const self = this
            return self.ready().then(() => {
                jcefQuery(BRIDGE.CONNECT)()
            })
        }
    }

    /**
     * Set ID of the given primary key loaded on form. This is so once
     * the web form is left other forms will be to load item that was
     * loaded on the web form.
     * @param {string} ID - string representation of long value to store
     * @param {string} primaryKey - primary key to where value is stored
    */
    synkSetFollowingID = (ID, primaryKey) => {
        if (this.isSynkros()) {
            jcefQuery(BRIDGE.SET_FOLLOWING_ID, ID, primaryKey)()
        }
    }

    /**
     * Returns the version number of Synkros else null
     * @return {?string} version
     */

    version = () => {
        if (this.isSynkros()) {
            debug('Synkros')
            const regex = new RegExp(/Synkros\/([\d.]*)/g)
            return regex.exec(window.navigator.userAgent)[1]
        } else {
            if (__DEV__) {
                debug('Browser')
            }
        }
    }

    /**
     * @private
     * Used by ready to wait for Synkros to be ready.
     */
    wait = (resolve, reject) => {
        // shouldn't this be !!window.java?
        if (!window.java) {
            debug('Synkros Wait')
            window.setTimeout(this.wait.bind(this, resolve, reject), 500)
        } else {
            this._ready = true
            debug('Synkros Ready')
            resolve(true)
        }
    }

    /**
    * ======================================================================
    * JavaScript Commands for Java to call
    * ======================================================================
    */
    // Assigned and unassigned in Login.js
    appMenuPressed = showMenu => { this._onShowMenu && this._onShowMenu(showMenu) }

    // Assigned in Home\components\Home.js
    menuRegister = listener => {
        this.favoritesChanged = listener.favoritesChanged || missing('favoritesChanged')
        this.rolesChanged = listener.rolesChanged || missing('rolesChanged')
    }

    menuUnregister = () => {
        this.favoritesChanged = noop
        this.rolesChanged = noop
    }

    /**
     * This function is fired by Synkros when a user logs in.
     * @param {number|string} employeeId - The employeeId from Synkros
     * @param {string} lang - The current users language code
     * @param {string} country - The current users country code
     * Note - Assigned in Login.js
     */
    userLoggedIn = (employeeId, lang, country) => {
        this._synkrosUser = { employeeId, lang, country }
        this._loggedIn = true
        this._userLoggedIn && this._userLoggedIn(employeeId, lang, country)
    }
}

export default Synkui.getInstance()
