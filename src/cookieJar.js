import { session } from 'electron';

export default class CookieJar{
    /** @type {[import('electron').Cookie]} */
    #cookies = []
    /**
     * 
     * @param {import('electron').BrowserWindow | null} window 
     */
    constructor(window) {
        if (window) this.add(window);
    }
    /** @param { [string] | string} cookies  */
    parseCookies(cookies) {
        try {
            if (!Array.isArray(cookies)) {
                cookies = [cookies];
            }
            for (let cookie of cookies) {
                if (!cookie) continue;
                const parsedCookieObject = {url: 'test-app://app'}
                switch (typeof cookie) {
                    case 'string': {
                        cookie.split(';').forEach((element, index) => {
                            /** @type {[string, string]} */
                            let [key, value] = element.split('=');
                            if (index === 0) {
                                parsedCookieObject.name = key;
                                parsedCookieObject.value = value;
                                return;
                            }
                            key = key.trim();
                            if (!value) value = true;
                            key = key[0].toLocaleLowerCase() + key.slice(1);
                            parsedCookieObject[key] = value;
                        })
                        break;
                    } default: {
                        continue;
                    }
                }
                this.#cookies.push(parsedCookieObject);
            }
        } catch (error) {
            console.log(error);
        }
    }
    // TODO Validate Cookie According To Time And Remove That Cookie From The Array
    #checkIfValidCookie(cookie) {
        return true;
    }
    get cookies () {
        let result = '';
        const validCookies = this.#cookies.filter((cookie) => {
            const isValid = this.#checkIfValidCookie(cookie);
            if (isValid) {
                result += `${cookie.name}=${cookie.value};`;
            }
            return isValid;
        })
        this.#cookies = validCookies;
        return result;
    }

    /**
     * 
     * @param {import('electron').BrowserWindow} window 
     * @param {import('electron').WebRequestFilter} filters
     * @param {{ request?: (requestHeaderDetails: import('electron').OnHeadersReceivedListenerDetails) => void, response?: (responseHeaderdetails: import('electron').OnBeforeSendHeadersListenerDetails) => void}} handler 
     */
    add(window, filters, handler) {
        window.webContents.session = session.defaultSession;
        // TODO Work on this to allow fromPartition Sessions
        //! When session.fromPartition is used onHeadersReceived and onBeforeSendHeaders are not called
        //* Hence has to set session to default

        const session_ = session.defaultSession;
        session_.webRequest.onHeadersReceived((details, callback) => {
            const cookies = details.responseHeaders['Set-Cookie'];
            this.parseCookies(cookies);
            handler?.request(details);
            callback({responseHeaders: details.responseHeaders})
        }) 

        session_.webRequest.onBeforeSendHeaders(filters,(details,callback) => {
            details.requestHeaders['Cookie'] = this.#cookies;
            handler?.response(details);
            callback({requestHeaders: details.requestHeaders})
        })
    }
    
}
