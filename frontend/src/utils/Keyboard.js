

/**
 * Standardizes the key modifier for the given event.
 *
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {number} - The key modifier factor
 */
export function getModifierFactor(event) {
  return event.ctrlKey ? 100 : event.shiftKey ? 10 : 1;
}

/**
 * Modifies the given value based on the event, sign, and step size.
 *
 * @param {Number} value - The initial value
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Number} sign - The direction to modify the value (1 for increase, -1 for decrease). Defaults to 1.
 * @param {Number} stepSize - The base step size for the modification. Defaults to 1.
 * @returns {Number} - The modified value
 */
export function modifyValue(event, value, sign = 1, stepSize = 1) {
  const modifier = getModifierFactor(event);
  return value + stepSize * sign * modifier;
}


export function isIncreaseKey(event){
  return event.key === "ArrowRight" || event.key === "ArrowUp";
}

export function isDecreaseKey(event){
  return event.key === "ArrowLeft" || event.key === "ArrowDown";
}

export function isArrowKey(event){
  return isIncreaseKey(event) || isDecreaseKey(event);
}

/**
 * Applies arrow key modifiers to the given value.
 * 
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Number} value - The initial value
 * @param {Number} stepSize - The step size for the modification
 * @returns {Number} - The modified value
 */
export function applyArrowModifiers(event, value, stepSize = 1) {
  let newValue = value
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    newValue = modifyValue(event, value, -1, stepSize);
  }

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    newValue = modifyValue(event, value, 1, stepSize);
  }

  return newValue;
}


