import CookieJar from './src/cookieJar';

/**
 * 
 * @param {import('electron').BrowserWindow} window 
 */
export default function createSession(window) {
    return new CookieJar(window);
}

