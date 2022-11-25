import variables from "../../css/variables.scss";

/**
 * Breakpoint in pixels at which to switch to mobile mode.
 */
const mobileBreakpoint = parseInt(variables["gridBreakpoints-md"], 10);


/**
 * Checks if the current window size indicates a mobile device.
 * @returns {Boolean}  true if screen is considered mobile device
 */
export default function isMobile () {
    return window.innerWidth < mobileBreakpoint;
}
